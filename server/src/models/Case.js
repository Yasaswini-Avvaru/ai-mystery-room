import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({
  id: { type: String, required: true }, name: { type: String, required: true }, ageRange: String,
  profile: { type: String, required: true }, relationshipToCase: { type: String, required: true },
  publicMotive: { type: String, required: true }, publicAlibi: { type: String, required: true },
  publicStatement: { type: String, required: true }, privateInvolvement: String
}, { _id: false });
const mediaSchema = new mongoose.Schema({ kind: { type: String, enum: ['IMAGE','VIDEO','AUDIO','TEXT_SIMULATION'] }, status: { type: String, enum: ['READY','PENDING','FAILED','PLACEHOLDER'] }, provider: String, storageUrl: String, mimeType: String, altText: String, failureMessage: String, generated: Boolean, fictionalLabel: String }, { _id: false });
const evidenceSchema = new mongoose.Schema({
  id: { type: String, required: true }, title: { type: String, required: true }, type: { type: String, enum: ['MESSAGE','IMAGE','CCTV','WITNESS_STATEMENT','DOCUMENT','PHYSICAL_CLUE','DIGITAL_LOG','TIMELINE_RECORD'], required: true },
  summary: { type: String, required: true }, content: { type: String, required: true }, sourceLabel: { type: String, required: true }, occurredAt: Date,
  relatedSuspectIds: [String], media: mediaSchema, visibility: { type: String, enum: ['PUBLIC','INTERNAL'], default: 'PUBLIC' },
  privateAnalysis: { canonicalFact: String, intendedDeduction: String, contradicts: [String], redHerring: Boolean, validationFindings: [String] }
}, { _id: false });
const solutionSchema = new mongoose.Schema({ culpritSuspectId: String, motive: String, actualEvents: String, canonicalTimeline: [String], solutionExplanation: String, supportingEvidenceIds: [String], contradictionEvidenceIds: [String] }, { _id: false });
const accusationSchema = new mongoose.Schema({ suspectId: String, explanation: String, isCorrect: Boolean, submittedAt: Date, idempotencyKey: String }, { _id: false });
const caseSchema = new mongoose.Schema({
  title: { type: String, required: true }, scenario: { type: String, required: true }, summary: String,
  genre: { type: String, required: true }, difficulty: { type: String, enum: ['EASY','MEDIUM','HARD'], required: true }, evidenceRichness: String,
  status: { type: String, enum: ['GENERATING','VALIDATING','GENERATION_FAILED','READY','RESOLVED'], default: 'GENERATING', index: true },
  suspects: [suspectSchema], evidence: [evidenceSchema], solution: solutionSchema, accusation: accusationSchema,
  generationMetadata: { stage: String, attempts: Number, generatedAt: Date, provider: String }
}, { timestamps: true, versionKey: false });
caseSchema.index({ createdAt: -1 });
export default mongoose.model('Case', caseSchema);
