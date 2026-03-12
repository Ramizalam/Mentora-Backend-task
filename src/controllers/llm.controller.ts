import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { LlmService } from '../services/llm.service';

const llmService = new LlmService();

export class LlmController {
    async summarize(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { text } = req.body;
            const result = await llmService.summarize(text);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
