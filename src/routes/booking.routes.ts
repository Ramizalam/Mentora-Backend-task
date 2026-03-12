import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const bookingController = new BookingController();

router.post(
    '/',
    authMiddleware,
    requireRole('PARENT'),
    validate([
        { field: 'studentId', required: true, type: 'string' },
        { field: 'lessonId', required: true, type: 'string' },
    ]),
    bookingController.create
);

router.get('/', authMiddleware, bookingController.getAll);

export default router;
