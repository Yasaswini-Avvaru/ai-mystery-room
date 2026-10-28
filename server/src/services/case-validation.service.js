const supportedTypes = new Set(['MESSAGE','IMAGE','CCTV','WITNESS_STATEMENT','DOCUMENT','PHYSICAL_CLUE','DIGITAL_LOG','TIMELINE_RECORD']);
const evidenceTypeAliases = Object.freeze({ NOTE: 'DOCUMENT', REPORT: 'DOCUMENT', EMAIL: 'MESSAGE', CHAT: 'MESSAGE', TEXT_MESSAGE: 'MESSAGE', PHOTO: 'IMAGE', PHOTOGRAPH: 'IMAGE', VIDEO: 'CCTV', SURVEILLANCE_VIDEO: 'CCTV', LOG: 'DIGITAL_LOG', RECORD: 'TIMELINE_RECORD', STATEMENT: 'WITNESS_STATEMENT', PHYSICAL_EVIDENCE: 'PHYSICAL_CLUE' });
export function normalizeEvidenceType(type) { const normalized = String(type || '').trim().toUpperCase(); return evidenceTypeAliases[normalized] || normalized; }

export function validateMystery(plan, expectedSuspects) {
  const errors = [];
  if (!plan || typeof plan !== 'object') return ['The generated case was empty.'];
  const suspects = plan.suspects;
  const evidence = plan.evidence;
  if (!Array.isArray(suspects) || suspects.length !== expectedSuspects) errors.push('Suspect count did not match the request.');
  if (!Array.isArray(evidence) || evidence.length < 7) errors.push('At least seven evidence artifacts are required.');
  const ids = new Set((suspects || []).map(s => s.id));
  if (ids.size !== (suspects || []).length || [...ids].some(id => typeof id !== 'string' || !id)) errors.push('Suspect IDs must be unique and non-empty.');
  if (!ids.has(plan.culpritSuspectId)) errors.push('The canonical culprit must be one of this case’s suspects.');
  const evidenceIds = new Set((evidence || []).map(e => e.id));
  if (evidenceIds.size !== (evidence || []).length || [...evidenceIds].some(id => typeof id !== 'string' || !id)) errors.push('Evidence IDs must be unique and non-empty.');
  for (const e of evidence || []) {
    if (!e.id || !e.title || !e.summary || !e.content || !e.sourceLabel) errors.push('An evidence artifact is missing required public content.');
    if (!supportedTypes.has(e.type)) errors.push(`Unsupported evidence type: ${e.type}`);
    if ((e.relatedSuspectIds || []).some(id => !ids.has(id))) errors.push(`Evidence ${e.id} references a suspect outside the case.`);
  }
  const support = plan.supportingEvidenceIds || [];
  const contradictions = plan.contradictionEvidenceIds || [];
  if (support.length < 2 || support.some(id => !evidenceIds.has(id))) errors.push('At least two valid supporting evidence items are required.');
  if (contradictions.length < 1 || contradictions.some(id => !evidenceIds.has(id))) errors.push('At least one valid contradiction evidence item is required.');
  const supportedFacts = (evidence || []).filter(e => support.includes(e.id) && e.privateAnalysis?.canonicalFact && !e.privateAnalysis?.redHerring);
  if (supportedFacts.length < 2) errors.push('Two independent evidence items must support established canonical facts.');
  if (!(evidence || []).some(e => contradictions.includes(e.id) && (e.privateAnalysis?.contradicts || []).includes(plan.culpritSuspectId))) errors.push('At least one clue must contradict the culprit’s account or alibi.');
  if (!Array.isArray(plan.canonicalTimeline) || plan.canonicalTimeline.length < 2) errors.push('A canonical timeline is required.');
  if (!plan.solutionExplanation || !plan.motive || !plan.actualEvents) errors.push('The canonical solution is incomplete.');
  return [...new Set(errors)];
}

export function toPublicCase(doc) {
  const c = doc.toObject ? doc.toObject() : doc;
  return { id: String(c._id), title: c.title, summary: c.summary, scenario: c.scenario, genre: c.genre, difficulty: c.difficulty, status: c.status,
    suspects: (c.suspects || []).map(({ id, name, ageRange, profile, relationshipToCase, publicMotive, publicAlibi, publicStatement }) => ({ id, name, ageRange, profile, relationshipToCase, publicMotive, publicAlibi, publicStatement })),
    evidence: (c.evidence || []).filter(e => e.visibility === 'PUBLIC').map(toPublicEvidence), createdAt: c.createdAt, updatedAt: c.updatedAt };
}
export function toPublicEvidence(e) { return { id: e.id, title: e.title, type: e.type, summary: e.summary, content: e.content, sourceLabel: e.sourceLabel, occurredAt: e.occurredAt, relatedSuspectIds: e.relatedSuspectIds || [], media: e.media ? { kind: e.media.kind, status: e.media.status, provider: e.media.provider, storageUrl: e.media.storageUrl, mimeType: e.media.mimeType, altText: e.media.altText, failureMessage: e.media.failureMessage, generated: e.media.generated, fictionalLabel: e.media.fictionalLabel } : undefined }; }
