import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const lessonController = new LessonController();

router.post(
    '/',
    authMiddleware,
    requireRole('MENTOR'),
    validate([
        { field: 'title', required: true, type: 'string', minLength: 2 },
        { field: 'description', required: true, type: 'string', minLength: 5 },
    ]),
    lessonController.create
);

router.get('/', authMiddleware, lessonController.getAll);
router.get('/:id', authMiddleware, lessonController.getById);

export default router;
