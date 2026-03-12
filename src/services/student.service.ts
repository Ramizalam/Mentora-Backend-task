import prisma from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';



export class StudentService {
    async create(data: { name: string; age: number; parentId: string }) {
        const { name, age, parentId } = data;

        const parent = await prisma.user.findUnique({ where: { id: parentId } });
        if (!parent || parent.role !== 'PARENT') {
            throw new BadRequestError('Invalid parent ID');
        }

        const student = await prisma.student.create({
            data: { name, age, parentId },
            include: { parent: { select: { id: true, name: true, email: true } } },
        });

        return student;
    }

    async getByParent(parentId: string) {
        return prisma.student.findMany({
            where: { parentId },
            include: { parent: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAll() {
        return prisma.student.findMany({
            include: { parent: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getById(id: string) {
        const student = await prisma.student.findUnique({
            where: { id },
            include: { parent: { select: { id: true, name: true, email: true } } },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        return student;
    }
}
