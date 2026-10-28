import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/api.routes.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { getMediaRoot } from './services/media.service.js';

const app=express();
app.disable('x-powered-by');
app.use(cors({origin:env.CLIENT_ORIGIN.split(',').map(origin=>origin.trim()).filter(Boolean)}));
app.use(express.json({limit:'32kb'}));
app.use('/media',express.static(getMediaRoot(),{fallthrough:false,maxAge:'1d',dotfiles:'deny',index:false}));
app.use('/api/cases',rateLimit({windowMs:env.RATE_LIMIT_WINDOW_MS,limit:env.RATE_LIMIT_MAX_REQUESTS,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api',routes);app.use(notFound);app.use(errorHandler);
export default app;
