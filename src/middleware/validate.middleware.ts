import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

type ValidationRule = {
    field: string;
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    enum?: string[];
};

export function validate(rules: ValidationRule[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        for (const rule of rules) {
            const value = req.body[rule.field];

            if (rule.required && (value === undefined || value === null || value === '')) {
                return next(new BadRequestError(`Field '${rule.field}' is required`));
            }

            if (value === undefined || value === null) continue;

            if (rule.type && typeof value !== rule.type) {
                return next(new BadRequestError(`Field '${rule.field}' must be of type ${rule.type}`));
            }

            if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
                return next(new BadRequestError(`Field '${rule.field}' must be at least ${rule.minLength} characters`));
            }

            if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
                return next(new BadRequestError(`Field '${rule.field}' must be at most ${rule.maxLength} characters`));
            }

            if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
                return next(new BadRequestError(`Field '${rule.field}' must be at least ${rule.min}`));
            }

            if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
                return next(new BadRequestError(`Field '${rule.field}' must be at most ${rule.max}`));
            }

            if (rule.enum && !rule.enum.includes(value)) {
                return next(new BadRequestError(`Field '${rule.field}' must be one of: ${rule.enum.join(', ')}`));
            }
        }

        next();
    };
}
