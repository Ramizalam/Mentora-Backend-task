import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const sessionController = new SessionController();

router.post(
    '/',
    authMiddleware,
    requireRole('MENTOR'),
    validate([
        { field: 'lessonId', required: true, type: 'string' },
        { field: 'date', required: true, type: 'string' },
        { field: 'topic', required: true, type: 'string', minLength: 2 },
    ]),
    sessionController.create
);

// Bonus: JOIN session (Parent assigns student to session)
router.post(
    '/:id/join',
    authMiddleware,
    requireRole('PARENT'),
    validate([{ field: 'studentId', required: true, type: 'string' }]),
    sessionController.joinSession
);

export default router;
