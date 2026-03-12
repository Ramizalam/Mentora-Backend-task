import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BookingService } from '../services/booking.service';

const bookingService = new BookingService();

export class BookingController {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const booking = await bookingService.create({
                ...req.body,
                parentId: req.userId!,
            });
            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const bookings =
                req.userRole === 'PARENT'
                    ? await bookingService.getByParent(req.userId!)
                    : await bookingService.getAll();
            res.status(200).json({ success: true, data: bookings });
        } catch (error) {
            next(error);
        }
    }
}
