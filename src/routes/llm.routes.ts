import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LlmController } from '../controllers/llm.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const llmController = new LlmController();

// Rate limiter: 10 requests per minute per IP
const llmRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many requests. Please try again after a minute.',
});

router.post('/summarize', authMiddleware, llmRateLimit, llmController.summarize);

export default router;
