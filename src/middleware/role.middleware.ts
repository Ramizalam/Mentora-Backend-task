import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';

export function requireRole(...roles: string[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return next(new ForbiddenError(`Access denied. Required role(s): ${roles.join(', ')}`));
        }
        next();
    };
}
