import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

try { await connectDatabase(); app.listen(env.PORT,()=>console.info(`AI Mystery Room API listening on ${env.PORT}`)); }
catch (error) { console.error('Unable to start API:',error.message); process.exit(1); }
