import prisma from '../config/prisma';
import { NotFoundError } from '../utils/errors';



export class LessonService {
    async create(data: { title: string; description: string; mentorId: string }) {
        const lesson = await prisma.lesson.create({
            data,
            include: { mentor: { select: { id: true, name: true, email: true } } },
        });

        return lesson;
    }

    async getAll() {
        return prisma.lesson.findMany({
            include: {
                mentor: { select: { id: true, name: true, email: true } },
                _count: { select: { bookings: true, sessions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getById(id: string) {
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                mentor: { select: { id: true, name: true, email: true } },
                _count: { select: { bookings: true, sessions: true } },
            },
        });

        if (!lesson) {
            throw new NotFoundError('Lesson not found');
        }

        return lesson;
    }
}
