import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

export class SessionController {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const session = await sessionService.create({
                ...req.body,
                mentorId: req.userId!,
            });
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async getByLesson(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const lessonId = req.params.id as string;
            const sessions = await sessionService.getByLesson(lessonId);
            res.status(200).json({ success: true, data: sessions });
        } catch (error) {
            next(error);
        }
    }

    async joinSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const attendee = await sessionService.joinSession({
                sessionId: req.params.id as string,
                studentId: req.body.studentId,
                parentId: req.userId!,
            });
            res.status(201).json({ success: true, data: attendee });
        } catch (error) {
            next(error);
        }
    }
}
