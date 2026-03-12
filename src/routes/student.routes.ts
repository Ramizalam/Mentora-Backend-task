import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const studentController = new StudentController();

router.post(
    '/',
    authMiddleware,
    requireRole('PARENT'),
    validate([
        { field: 'name', required: true, type: 'string', minLength: 2 },
        { field: 'age', required: true, type: 'number', min: 1, max: 100 },
    ]),
    studentController.create
);

router.get('/', authMiddleware, studentController.getAll);

export default router;
