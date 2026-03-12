import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const authController = new AuthController();

router.post(
    '/signup',
    validate([
        { field: 'name', required: true, type: 'string', minLength: 2 },
        { field: 'email', required: true, type: 'string' },
        { field: 'password', required: true, type: 'string', minLength: 6 },
        { field: 'role', required: true, type: 'string', enum: ['PARENT', 'MENTOR'] },
    ]),
    authController.signup
);

router.post(
    '/login',
    validate([
        { field: 'email', required: true, type: 'string' },
        { field: 'password', required: true, type: 'string' },
    ]),
    authController.login
);

router.get('/me', authMiddleware, authController.getMe);

export default router;
