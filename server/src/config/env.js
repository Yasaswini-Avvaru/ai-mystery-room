import dotenv from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().optional().default('gemini-3.5-flash-lite'),
  GEMINI_IMAGE_MODEL: z.string().optional().default('gemini-3.1-flash-image'),
  GEMINI_VIDEO_MODEL: z.string().optional().default('veo-3.1-generate-preview'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
  GEMINI_VIDEO_TIMEOUT_MS: z.coerce.number().int().positive().default(600000),
  GEMINI_MAX_RETRIES: z.coerce.number().int().min(0).max(4).default(2),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  CASE_GENERATION_LIMIT: z.coerce.number().int().positive().default(5)
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid server environment configuration:', parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  process.exit(1);
}
export const env = parsed.data;
