import prisma from '../config/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';



export class SessionService {
    async create(data: { lessonId: string; date: string; topic: string; summary?: string; mentorId: string }) {
        const { lessonId, date, topic, summary, mentorId } = data;

        // Verify lesson exists and belongs to mentor
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw new NotFoundError('Lesson not found');
        }
        if (lesson.mentorId !== mentorId) {
            throw new ForbiddenError('You can only create sessions for your own lessons');
        }

        const session = await prisma.session.create({
            data: {
                lessonId,
                date: new Date(date),
                topic,
                summary: summary || null,
            },
            include: {
                lesson: { select: { id: true, title: true } },
            },
        });

        return session;
    }

    async getByLesson(lessonId: string) {
        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw new NotFoundError('Lesson not found');
        }

        return prisma.session.findMany({
            where: { lessonId },
            include: {
                lesson: { select: { id: true, title: true } },
                _count: { select: { attendees: true } },
            },
            orderBy: { date: 'asc' },
        });
    }

    async joinSession(data: { sessionId: string; studentId: string; parentId: string }) {
        const { sessionId, studentId, parentId } = data;

        // Verify session exists
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { lesson: true },
        });
        if (!session) {
            throw new NotFoundError('Session not found');
        }

        // Verify student belongs to parent
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            throw new NotFoundError('Student not found');
        }
        if (student.parentId !== parentId) {
            throw new ForbiddenError('You can only join sessions for your own students');
        }

        // Verify student is booked for this lesson
        const booking = await prisma.booking.findUnique({
            where: { studentId_lessonId: { studentId, lessonId: session.lessonId } },
        });
        if (!booking) {
            throw new BadRequestError('Student must be booked for this lesson to join a session');
        }

        // Check if already joined
        const existing = await prisma.sessionAttendee.findUnique({
            where: { sessionId_studentId: { sessionId, studentId } },
        });
        if (existing) {
            throw new BadRequestError('Student has already joined this session');
        }

        const attendee = await prisma.sessionAttendee.create({
            data: { sessionId, studentId },
            include: {
                session: { select: { id: true, topic: true, date: true } },
                student: { select: { id: true, name: true } },
            },
        });

        return attendee;
    }
}
