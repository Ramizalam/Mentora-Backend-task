import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';



export class AuthService {
    async signup(data: { name: string; email: string; password: string; role: string }) {
        const { name, email, password, role } = data;

        if (role !== 'PARENT' && role !== 'MENTOR') {
            throw new BadRequestError('Only PARENT and MENTOR roles can sign up');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new BadRequestError('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as 'PARENT' | 'MENTOR',
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        const token = generateToken({ userId: user.id, role: user.role });

        return { user, token };
    }

    async login(data: { email: string; password: string }) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const token = generateToken({ userId: user.id, role: user.role });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
            token,
        };
    }

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        return user;
    }
}
