import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { AppError, BadRequestError, PayloadTooLargeError } from '../utils/errors';

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 10000;
const MODEL_NAME = 'gemini-2.0-flash';

export class LlmService {
    private genAI: GoogleGenAI;

    constructor() {
        if (!env.GEMINI_API_KEY) {
            console.warn('WARNING: GEMINI_API_KEY is not set. LLM features will not work.');
        }
        this.genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }

    async summarize(text: string): Promise<{ summary: string; model: string }> {
        // Input validation
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new BadRequestError('Text is required and cannot be empty');
        }

        const trimmed = text.trim();

        if (trimmed.length < MIN_TEXT_LENGTH) {
            throw new BadRequestError(`Text must be at least ${MIN_TEXT_LENGTH} characters long (received ${trimmed.length})`);
        }

        if (trimmed.length > MAX_TEXT_LENGTH) {
            throw new PayloadTooLargeError(`Text must be at most ${MAX_TEXT_LENGTH} characters long (received ${trimmed.length})`);
        }

        try {
            const prompt = `Summarize the following text into 3-6 concise bullet points. Each bullet point should capture a key idea or piece of information. Be clear and concise.\n\nText:\n${trimmed}`;

            const response = await this.genAI.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
            });

            const summary = response.text;

            if (!summary) {
                throw new AppError('LLM returned an empty response', 502);
            }

            return {
                summary: summary.trim(),
                model: MODEL_NAME,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error('LLM API error:', error);
            throw new AppError('Failed to get summary from LLM service', 502);
        }
    }
}
