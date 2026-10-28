import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { normalizeEvidenceType, validateMystery } from './case-validation.service.js';

const client = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;
const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);

function safeProviderMessage(error) {
  return String(error?.message || error || 'Unknown provider error')
    .replaceAll(env.GEMINI_API_KEY || '\u0000', '[REDACTED]')
    .replaceAll(env.MONGODB_URI || '\u0000', '[REDACTED]')
    .replace(/AIza[\w-]{20,}/g, '[REDACTED]')
    .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .slice(0, 600);
}

function errorChain(error) {
  const entries = [];
  let current = error;
  while (current && entries.length < 4) {
    entries.push({ name: current.name, code: current.code, status: current.status, message: safeProviderMessage(current) });
    current = current.cause;
  }
  return entries;
}

function hasNetworkFailure(error) {
  let current = error;
  for (let depth = 0; current && depth < 4; depth += 1, current = current.cause) {
    if (['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT'].includes(current.code)) return true;
  }
  return ['ConnectionError', 'APIConnectionError'].includes(error?.name);
}

function providerFailure(error) {
  const status = Number(error?.status);
  if (error?.code === 'INVALID_AI_OUTPUT') return { status: 502, code: 'INVALID_AI_OUTPUT', message: error.message };
  if (error?.name === 'AbortError' || error?.name === 'RequestTimeoutError' || error?.name === 'RequestAbortedError' || error?.name === 'APIConnectionTimeoutError') {
    return { status: 504, code: 'AI_TIMEOUT', message: 'Gemini did not respond before the configured timeout. Check the server network and GEMINI_TIMEOUT_MS, then retry.' };
  }
  if (status === 401) return { status: 503, code: 'AI_AUTH_ERROR', message: 'Gemini rejected the configured API key. Check GEMINI_API_KEY in server/.env.' };
  if (status === 403) return { status: 503, code: 'AI_ACCESS_ERROR', message: 'Gemini denied access. Check API key permissions, project billing, and model access.' };
  if (status === 404) return { status: 502, code: 'AI_MODEL_ERROR', message: `Gemini model "${env.GEMINI_MODEL}" was not found. Check GEMINI_MODEL in server/.env.` };
  if (status === 429) return { status: 503, code: 'AI_RATE_LIMITED', message: 'Gemini rate limit or quota reached. Check project quota and try again later.' };
  if (status === 503 || status === 500 || status === 502 || status === 504) return { status: 503, code: 'AI_PROVIDER_BUSY', message: 'Gemini is temporarily unavailable or at high capacity. Please retry in a moment.' };
  if (hasNetworkFailure(error) || (error?.name === 'TypeError' && /fetch failed/i.test(error.message || ''))) return { status: 503, code: 'AI_NETWORK_ERROR', message: 'The server could not reach Gemini. Check server network and DNS, then retry.' };
  return { status: 502, code: 'AI_PROVIDER_ERROR', message: 'Gemini request failed. Check the server log for the redacted provider diagnostic.' };
}

function parseJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(cleaned); }
  catch (error) {
    const position = String(error?.message || '').match(/position\s+(\d+)/i)?.[1];
    throw Object.assign(new Error('The mystery provider returned an invalid case. Please try again.'), { status: 502, code: 'INVALID_AI_OUTPUT', parseIssue: position ? `JSON parse failed near offset ${position}` : 'Response was empty or incomplete' });
  }
}

function attachPlannedAnalysis(evidence, evidencePlan) {
  if (!Array.isArray(evidence)) return evidence;
  const plannedById = new Map((evidencePlan.artifacts || []).map(item => [item.id, item]));
  return evidence.map(item => {
    const planned = plannedById.get(item.id);
    const normalized = { ...item, type: normalizeEvidenceType(planned?.type || item.type) };
    if (!planned) return normalized;
    return {
      ...normalized,
      privateAnalysis: {
        ...item.privateAnalysis,
        canonicalFact: planned.canonicalFact,
        contradicts: Array.isArray(planned.contradicts) ? planned.contradicts : [],
        redHerring: planned.redHerring === true
      }
    };
  });
}

async function generateJson(prompt, stage) {
  let last;
  for (let attempt = 0; attempt <= env.GEMINI_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS);
    try {
      const response = await client.models.generateContent({ model: env.GEMINI_MODEL, contents: prompt, config: { responseMimeType: 'application/json', temperature: 0.75, abortSignal: controller.signal, maxOutputTokens: 20000, httpOptions: { timeout: env.GEMINI_TIMEOUT_MS, retryOptions: { attempts: 1 } } } });
      const text = response.text || '';
      try { return parseJson(text); }
      catch (error) {
        error.responseMeta = { finishReason: response.candidates?.[0]?.finishReason, blockReason: response.promptFeedback?.blockReason, candidateCount: response.candidates?.length || 0, outputCharacters: text.length, outputTokens: response.usageMetadata?.candidatesTokenCount };
        error.rawText = text;
        throw error;
      }
    } catch (error) {
      last = error;
      const status = Number(error?.status);
      const timedOut = error?.name === 'AbortError' || error?.name === 'RequestTimeoutError' || error?.name === 'RequestAbortedError' || error?.name === 'APIConnectionTimeoutError';
      const retryable = error?.code !== 'INVALID_AI_OUTPUT' && (timedOut || retryableStatuses.has(status) || hasNetworkFailure(error));
      console.error('[Gemini] request failed', JSON.stringify({ stage, model: env.GEMINI_MODEL, attempt: attempt + 1, errors: errorChain(error), responseMeta: error?.responseMeta, parseIssue: error?.parseIssue }));
      if (!retryable || attempt >= env.GEMINI_MAX_RETRIES) break;
      const delay = Math.min(1000 * (2 ** attempt), 8000) + Math.floor(Math.random() * 300);
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally { clearTimeout(timeout); }
  }
  if (last?.code === 'INVALID_AI_OUTPUT' && typeof last.rawText === 'string' && !stage.endsWith('_JSON_REPAIR')) {
    const syntaxRepairPrompt = `The text below is intended to be one JSON value but has a syntax error. Repair JSON syntax only: preserve every key, value, string, and array item exactly as written; do not summarize, invent, remove, or change case content. Return only the corrected JSON value.\nMALFORMED JSON TEXT: ${JSON.stringify(last.rawText)}`;
    console.warn('[Gemini] attempting JSON syntax repair', JSON.stringify({ stage, outputCharacters: last.rawText.length, parseIssue: last.parseIssue }));
    return generateJson(syntaxRepairPrompt, `${stage}_JSON_REPAIR`);
  }
  const failure = providerFailure(last);
  throw Object.assign(new Error(failure.message), { status: failure.status, code: failure.code });
}

export async function generateMystery(input, onStage = () => {}) {
  if (!client) throw Object.assign(new Error('Mystery generation is unavailable until a Gemini API key is configured on the server.'), { status: 503, code: 'AI_NOT_CONFIGURED' });

  onStage('CASE_PLANNING');
  const planPrompt = `Plan the canonical truth for a fair, fully fictional detective mystery. Return only valid JSON. Treat the user's scenario as the source of truth for the premise: preserve its setting, characters, tone, key events, and explicit instructions. Do not replace it with a generic crime story. If it is not already a crime mystery, build the investigation around the central question or suspicious event the user supplied, without adding a more serious crime unless the user asked for one. Treat genre, difficulty, suspect count, and evidence richness as additional constraints. Exactly one culprit and exactly ${input.suspectCount} suspects. Create a coherent event timeline and motive appropriate to the user's premise. Plan at least two independent facts that could support the culprit and one fact that contradicts or materially weakens the culprit's account. The truth and timeline must be fixed in this stage; later artifacts must not change them. Keep all people and events fictional; do not include real credentials, government IDs, bank records or sensitive personal data.\nUSER REQUEST AND SETTINGS: ${JSON.stringify(input)}\nJSON SHAPE: {"title":"...","summary":"...","culpritSuspectId":"s1","actualEvents":"private canonical account","motive":"...","canonicalTimeline":["at least two ordered events"],"solutionExplanation":"private explanation outline","suspects":[{"id":"s1","name":"...","ageRange":"adult","profile":"...","relationshipToCase":"...","publicMotive":"...","publicAlibi":"...","publicStatement":"...","privateInvolvement":"..."}],"requiredClues":[{"fact":"...","supportsCulprit":true},{"fact":"...","supportsCulprit":true},{"fact":"...","contradictsCulprit":true}]}.`;
  const plan = await generateJson(planPrompt, 'CASE_PLANNING');

  onStage('EVIDENCE_PLANNING');
  const count = input.evidenceRichness === 'DETAILED' ? 10 : 8;
  const rawEvidencePlan = await generateJson(`Plan exactly ${count} evidence artifacts from the private canonical plan below. This is an evidence plan only; do not write full artifact text. Make every clue fit the user's premise, setting, tone, and explicit constraints; choose artifact types that make sense for this case rather than forcing irrelevant formats. Use only these exact type values: MESSAGE, IMAGE, CCTV, WITNESS_STATEMENT, DOCUMENT, PHYSICAL_CLUE, DIGITAL_LOG, TIMELINE_RECORD. Do not use aliases such as NOTE, LOG, PHOTO, or VIDEO. Include at least TWO IMAGE artifacts when compatible with the user's request, each depicting a concrete clue suitable for a generated evidence photograph. If the user explicitly asks for text-only evidence or no images, honor that request. Assign each artifact a unique id, purpose, canonicalFact, supported type, related suspect IDs, and coherent timestamp. At least two separate artifacts support the culprit using independent facts and at least one materially contradicts the culprit's account. Put the IDs of those exact supporting and contradictory artifacts in the corresponding arrays. Keep red herrings explainable. Return JSON {"artifacts":[{"id":"e1","type":"IMAGE","purpose":"...","canonicalFact":"...","relatedSuspectIds":["s1"],"occurredAt":"ISO date or null","contradicts":["suspect id"],"redHerring":false}],"supportingEvidenceIds":["e1","e2"],"contradictionEvidenceIds":["e3"]}. Do not alter canonical facts.\nPRIVATE CANONICAL PLAN: ${JSON.stringify(plan)}`, 'EVIDENCE_PLANNING');
  const evidencePlan = { ...rawEvidencePlan, artifacts: (rawEvidencePlan.artifacts || []).map(item => ({ ...item, type: normalizeEvidenceType(item.type) })) };

  onStage('ARTIFACT_GENERATION');
  const artifactPrompt = `Write the actual player-facing content for every artifact in the evidence plan below. Return only valid JSON. Preserve its IDs, types, purposes, facts, suspect references, contradiction targets, and timestamps. Do NOT change the culprit, motive, timeline, statements or underlying events. Artifacts must be fair and coherent. For IMAGE and CCTV artifacts, describe the fictional visual evidence faithfully; a separate media service generates the actual image or video. Do not claim a media file exists in the artifact text. All evidence is fictional. Keep privateAnalysis separate from visible content; never put intended deductions or canonical solution wording into the visible artifact.\nCANONICAL PLAN (private): ${JSON.stringify(plan)}\nEVIDENCE PLAN (private): ${JSON.stringify(evidencePlan)}\nJSON SHAPE: {"evidence":[{"id":"e1","title":"...","type":"MESSAGE|IMAGE|CCTV|WITNESS_STATEMENT|DOCUMENT|PHYSICAL_CLUE|DIGITAL_LOG|TIMELINE_RECORD","summary":"...","content":"full player-visible text artifact","sourceLabel":"FICTIONAL ...","occurredAt":"ISO date or null","relatedSuspectIds":["s1"],"privateAnalysis":{"canonicalFact":"...","intendedDeduction":"...","contradicts":["suspect id"],"redHerring":false}}]}.`;
  let artifacts = await generateJson(artifactPrompt, 'ARTIFACT_GENERATION');
  let candidate = { ...plan, evidence: attachPlannedAnalysis(artifacts.evidence, evidencePlan), supportingEvidenceIds: evidencePlan.supportingEvidenceIds, contradictionEvidenceIds: evidencePlan.contradictionEvidenceIds };
  let problems = validateMystery(candidate, input.suspectCount);
  if (problems.length) {
    onStage('CASE_REPAIR');
    const repairPrompt = `Repair the evidence package so it passes every listed case validation error. Keep the canonical truth, culprit, facts, suspect list, and timestamps unchanged. Return only JSON with "evidence", "supportingEvidenceIds", and "contradictionEvidenceIds". Include at least seven distinct artifacts. Every artifact must have a unique id, title, summary, content, sourceLabel, valid type, and only valid suspect IDs. Follow any user request about image or text-only evidence. The supporting IDs must each match an evidence id and each matching item's privateAnalysis.canonicalFact must support an established non-red-herring fact. The contradiction IDs must match an evidence id whose privateAnalysis.contradicts includes the exact culprit ID. Ensure at least two independent supporting clues and at least one culprit-alibi contradiction. Preserve the existing clues wherever possible and add or correct only what is needed.\nVALIDATION ERRORS: ${JSON.stringify(problems)}\nCULPRIT ID: ${plan.culpritSuspectId}\nCANONICAL PLAN: ${JSON.stringify(plan)}\nEVIDENCE PLAN: ${JSON.stringify(evidencePlan)}\nCURRENT EVIDENCE PACKAGE: ${JSON.stringify({ evidence: candidate.evidence, supportingEvidenceIds: candidate.supportingEvidenceIds, contradictionEvidenceIds: candidate.contradictionEvidenceIds })}`;
    const repaired = await generateJson(repairPrompt, 'CASE_REPAIR');
    candidate = { ...candidate, evidence: attachPlannedAnalysis(repaired.evidence, evidencePlan), supportingEvidenceIds: repaired.supportingEvidenceIds, contradictionEvidenceIds: repaired.contradictionEvidenceIds };
    problems = validateMystery(candidate, input.suspectCount);
  }
  if (problems.length) {
    console.error('[CaseValidation] Gemini case failed validation after repair', JSON.stringify({ problems }));
    throw Object.assign(new Error('Gemini could not produce a consistent case after one repair attempt. Please try again.'), { status: 502, code: 'CASE_VALIDATION_FAILED', details: problems });
  }
  return candidate;
}
