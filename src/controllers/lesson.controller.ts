import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { LessonService } from '../services/lesson.service';

const lessonService = new LessonService();

export class LessonController {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const lesson = await lessonService.create({
                ...req.body,
                mentorId: req.userId!,
            });
            res.status(201).json({ success: true, data: lesson });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const lessons = await lessonService.getAll();
            res.status(200).json({ success: true, data: lessons });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const lesson = await lessonService.getById(req.params.id as string);
            res.status(200).json({ success: true, data: lesson });
        } catch (error) {
            next(error);
        }
    }
}
