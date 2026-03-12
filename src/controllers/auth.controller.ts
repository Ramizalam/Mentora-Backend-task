import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
    async signup(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await authService.signup(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async login(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.getMe(req.userId!);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
}
