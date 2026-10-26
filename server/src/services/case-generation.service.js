import Case from '../models/Case.js';
import { generateMystery } from './gemini.service.js';
import { validateMystery } from './case-validation.service.js';
import { env } from '../config/env.js';
import { generateEvidenceMedia } from './media.service.js';

export async function createCase(input) {
  const doc = await Case.create({ title: input.title || 'Untitled Case', scenario: input.scenario, genre: input.genre, difficulty: input.difficulty, evidenceRichness: input.evidenceRichness, status: 'GENERATING', generationMetadata: { stage: 'CASE_PLANNING', attempts: 0, provider: 'gemini' } });
  try {
    const plan = await generateMystery(input, async stage => {
      await Case.updateOne({ _id: doc._id }, { $set: { 'generationMetadata.stage': stage } });
    });
    await Case.updateOne({ _id: doc._id }, { $set: { status: 'VALIDATING', 'generationMetadata.stage': 'VALIDATION' } });
    const problems = validateMystery(plan, input.suspectCount);
    if (problems.length) throw Object.assign(new Error(`Generated case failed validation: ${problems.join(' ')}`), { status: 502, code: 'CASE_VALIDATION_FAILED' });
    await Case.updateOne({ _id: doc._id }, { $set: { 'generationMetadata.stage': 'MEDIA_GENERATION' } });
    const evidence = [];
    for (const artifact of plan.evidence) {
      const media = await generateEvidenceMedia(artifact, String(doc._id));
      evidence.push({ ...artifact, visibility: 'PUBLIC', occurredAt: artifact.occurredAt ? new Date(artifact.occurredAt) : undefined, media });
    }
    const solution = { culpritSuspectId: plan.culpritSuspectId, motive: plan.motive, actualEvents: plan.actualEvents, canonicalTimeline: plan.canonicalTimeline || [], solutionExplanation: plan.solutionExplanation, supportingEvidenceIds: plan.supportingEvidenceIds, contradictionEvidenceIds: plan.contradictionEvidenceIds };
    await Case.updateOne({ _id: doc._id }, { $set: { title: input.title || plan.title || 'Untitled Case', summary: plan.summary || input.scenario, suspects: plan.suspects.map(s => ({ ...s, privateInvolvement: s.privateInvolvement || '' })), evidence, solution, status: 'READY', 'generationMetadata.stage': 'READY', 'generationMetadata.generatedAt': new Date(), 'generationMetadata.attempts': 1 } });
    return Case.findById(doc._id);
  } catch (error) {
    try {
      await Case.updateOne({ _id: doc._id }, { $set: { status: 'GENERATION_FAILED', 'generationMetadata.stage': 'FAILED' } });
    } catch (persistenceError) {
      const message = String(persistenceError?.message || '').replaceAll(env.MONGODB_URI, '[REDACTED]').replaceAll(env.GEMINI_API_KEY || '\u0000', '[REDACTED]').slice(0, 500);
      console.error('[CaseGeneration] failed to persist generation failure state', JSON.stringify({ name: persistenceError?.name, code: persistenceError?.code, message }));
    }
    throw error;
  }
}
