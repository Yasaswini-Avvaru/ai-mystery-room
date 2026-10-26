import { createHash } from 'node:crypto';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const client = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;
const mediaRoot = fileURLToPath(new URL('../../uploads/', import.meta.url));
const videoPollIntervalMs = 10000;
const maxVideoBytes = 50 * 1024 * 1024;

function mediaFilename(evidenceId, extension) {
  const digest = createHash('sha256').update(String(evidenceId)).digest('hex').slice(0, 24);
  return `${digest}.${extension}`;
}

function redact(message) {
  return String(message || 'Unknown media provider error')
    .replaceAll(env.GEMINI_API_KEY || '\u0000', '[REDACTED]')
    .replace(/AIza[\w-]{20,}/g, '[REDACTED]')
    .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]')
    .slice(0, 500);
}

function safeMediaUrl(caseId, fileName) {
  return `/media/cases/${caseId}/${basename(fileName)}`;
}

export async function generateEvidenceImage({ caseId, evidence }) {
  if (!client) throw new Error('GEMINI_API_KEY is required for image generation.');
  const prompt = `Create a photorealistic fictional evidence photograph for a detective mystery, like an un-staged photo taken by an investigator with a real camera. Depict only this described scene or object: ${evidence.title}. ${evidence.summary}. Visible artifact context: ${evidence.content}. Use natural physically consistent lighting, realistic materials, believable camera perspective, subtle imperfections, and documentary color; avoid illustration, painting, 3D-render appearance, dramatic movie lighting, or staged composition. No legible text, logos, real people, identifiable faces, graphic content, or clues that contradict the description. This is fictional game evidence.`;
  const response = await client.models.generateContent({
    model: env.GEMINI_IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: '4:3', imageSize: '1K' },
      maxOutputTokens: 2048,
      httpOptions: { timeout: env.GEMINI_TIMEOUT_MS, retryOptions: { attempts: 1 } }
    }
  });
  const imagePart = response.candidates?.flatMap(candidate => candidate.content?.parts || []).find(part => part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/'));
  if (!imagePart) throw new Error('Gemini image model returned no image data.');

  const extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[imagePart.inlineData.mimeType];
  if (!extension) throw new Error(`Gemini returned an unsupported image type: ${imagePart.inlineData.mimeType}`);
  const directory = join(mediaRoot, 'cases', caseId);
  await mkdir(directory, { recursive: true });
  const filename = mediaFilename(evidence.id, extension);
  await writeFile(join(directory, filename), Buffer.from(imagePart.inlineData.data, 'base64'), { flag: 'w' });
  return { kind: 'IMAGE', status: 'READY', provider: env.GEMINI_IMAGE_MODEL, storageUrl: safeMediaUrl(caseId, filename), mimeType: imagePart.inlineData.mimeType, altText: `${evidence.title}, fictional AI-generated evidence image`, generated: true, fictionalLabel: 'FICTIONAL AI-GENERATED IMAGE' };
}

export async function generateEvidenceVideo({ caseId, evidence }) {
  if (!client) throw new Error('GEMINI_API_KEY is required for video generation.');
  const prompt = `Create a short fictional CCTV surveillance clip for a detective mystery. Scene: ${evidence.title}. ${evidence.summary}. Transcript/context: ${evidence.content}. Fixed security camera, wide 16:9 shot, muted low-light surveillance appearance, subtle timestamp-free footage, no legible text, no logos, no recognizable real people, no graphic content. Preserve the scene described; do not add actions that contradict it. This is simulated fictional game evidence.`;
  const startedAt = Date.now();
  let operation = await client.models.generateVideos({
    model: env.GEMINI_VIDEO_MODEL,
    prompt,
    config: {
      numberOfVideos: 1,
      durationSeconds: 4,
      aspectRatio: '16:9',
      resolution: '720p',
      personGeneration: 'dont_allow',
      generateAudio: false,
      httpOptions: { timeout: env.GEMINI_TIMEOUT_MS, retryOptions: { attempts: 1 } }
    }
  });

  while (!operation.done && Date.now() - startedAt < env.GEMINI_VIDEO_TIMEOUT_MS) {
    await new Promise(resolve => setTimeout(resolve, videoPollIntervalMs));
    operation = await client.operations.getVideosOperation({ operation });
  }
  if (!operation.done) throw new Error(`Video generation exceeded GEMINI_VIDEO_TIMEOUT_MS (${env.GEMINI_VIDEO_TIMEOUT_MS}).`);
  if (operation.error) throw new Error(`Video generation failed: ${JSON.stringify(operation.error).slice(0, 400)}`);

  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) throw new Error('Veo completed without returning a video file.');
  const directory = join(mediaRoot, 'cases', caseId);
  await mkdir(directory, { recursive: true });
  const filename = mediaFilename(evidence.id, 'mp4');
  const destination = join(directory, filename);
  try {
    await client.files.download({ file: video, downloadPath: destination });
    const fileInfo = await stat(destination);
    if (fileInfo.size === 0 || fileInfo.size > maxVideoBytes) throw new Error('Generated video size was empty or exceeded the 50 MB limit.');
  } catch (error) {
    await rm(destination, { force: true });
    throw error;
  }
  return { kind: 'VIDEO', status: 'READY', provider: env.GEMINI_VIDEO_MODEL, storageUrl: safeMediaUrl(caseId, filename), mimeType: 'video/mp4', altText: `${evidence.title}, fictional AI-generated surveillance video`, generated: true, fictionalLabel: 'FICTIONAL AI-GENERATED VIDEO' };
}

export async function generateEvidenceMedia(evidence, caseId) {
  const generator = evidence.type === 'IMAGE' ? generateEvidenceImage : evidence.type === 'CCTV' ? generateEvidenceVideo : null;
  if (!generator) return evidence.media;
  const kind = evidence.type === 'CCTV' ? 'VIDEO' : 'IMAGE';
  try {
    return await generator({ caseId, evidence });
  } catch (error) {
    console.error('[MediaGeneration] failed', JSON.stringify({ evidenceId: evidence.id, evidenceType: evidence.type, provider: evidence.type === 'CCTV' ? env.GEMINI_VIDEO_MODEL : env.GEMINI_IMAGE_MODEL, name: error?.name, status: error?.status, code: error?.code, message: redact(error?.message) }));
    const status = Number(error?.status);
    const failureMessage = status === 429 || error?.code === 'RESOURCE_EXHAUSTED'
      ? `Google Gemini ${kind === 'IMAGE' ? 'image' : 'video'} quota is exhausted. Enable billing or increase this model's quota in Google AI Studio, then create a new case.`
      : status === 401
        ? 'Google Gemini rejected the configured API key. Check GEMINI_API_KEY in server/.env.'
        : status === 403
          ? 'Google Gemini denied access to this media model. Check project billing and model access.'
          : `Media generation failed. Check the redacted [MediaGeneration] server log for the provider error.`;
    return { kind, status: 'FAILED', provider: evidence.type === 'CCTV' ? env.GEMINI_VIDEO_MODEL : env.GEMINI_IMAGE_MODEL, altText: `Media could not be generated. See the written ${evidence.type === 'CCTV' ? 'surveillance record' : 'evidence description'}.`, failureMessage, generated: false, fictionalLabel: 'FICTIONAL EVIDENCE · MEDIA GENERATION FAILED' };
  }
}

export function getMediaRoot() { return mediaRoot; }
