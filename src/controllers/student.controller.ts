import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { StudentService } from '../services/student.service';

const studentService = new StudentService();

export class StudentController {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const student = await studentService.create({
                ...req.body,
                parentId: req.userId!,
            });
            res.status(201).json({ success: true, data: student });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const students =
                req.userRole === 'PARENT'
                    ? await studentService.getByParent(req.userId!)
                    : await studentService.getAll();
            res.status(200).json({ success: true, data: students });
        } catch (error) {
            next(error);
        }
    }
}
