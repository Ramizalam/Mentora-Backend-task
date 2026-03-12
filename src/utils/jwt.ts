import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
    userId: string;
    role: string;
}

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
