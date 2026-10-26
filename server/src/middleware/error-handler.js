import { env } from '../config/env.js';

function safeDiagnostic(value) {
  return String(value || 'An unexpected server error occurred.')
    .replaceAll(env.GEMINI_API_KEY || '\u0000', '[REDACTED]')
    .replaceAll(env.MONGODB_URI || '\u0000', '[REDACTED]')
    .replace(/AIza[\w-]{20,}/g, '[REDACTED]')
    .replace(/([?&](?:key|token|access_token)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, 'mongodb://[REDACTED]')
    .slice(0, 800);
}

export function notFound(req,res){res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'API route not found.'}});}
export function errorHandler(err,req,res,next){if(res.headersSent)return next(err);const status=Number(err.status)||500;const code=err.code||'INTERNAL_ERROR';const diagnostic=safeDiagnostic(err.message);const message=status>=500&&env.NODE_ENV==='production'?'An unexpected server error occurred.':diagnostic;if(status>=500)console.error(`[${code}]`,diagnostic);res.status(status).json({success:false,error:{code,message}});}
