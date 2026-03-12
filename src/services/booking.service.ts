import prisma from '../config/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

export class BookingService {
    async create(data: { studentId: string; lessonId: string; parentId: string }) {
        const { studentId, lessonId, parentId } = data;

        // Verify student belongs to this parent
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            throw new NotFoundError('Student not found');
        }
        if (student.parentId !== parentId) {
            throw new ForbiddenError('You can only book lessons for your own students');
        }

        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw new NotFoundError('Lesson not found');
        }

        // Check for duplicate booking
        const existing = await prisma.booking.findUnique({
            where: { studentId_lessonId: { studentId, lessonId } },
        });
        if (existing) {
            throw new BadRequestError('Student is already booked for this lesson');
        }

        const booking = await prisma.booking.create({
            data: { studentId, lessonId },
            include: {
                student: { select: { id: true, name: true, age: true } },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        mentor: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return booking;
    }

    async getByParent(parentId: string) {
        const students = await prisma.student.findMany({
            where: { parentId },
            select: { id: true },
        });

        const studentIds = students.map((s: { id: string }) => s.id);

        return prisma.booking.findMany({
            where: { studentId: { in: studentIds } },
            include: {
                student: { select: { id: true, name: true, age: true } },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        mentor: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAll() {
        return prisma.booking.findMany({
            include: {
                student: { select: { id: true, name: true, age: true } },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        mentor: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
