import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import lessonRoutes from './routes/lesson.routes';
import bookingRoutes from './routes/booking.routes';
import sessionRoutes from './routes/session.routes';
import llmRoutes from './routes/llm.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware, AuthRequest } from './middleware/auth.middleware';
import { AuthService } from './services/auth.service';
import { SessionController } from './controllers/session.controller';

const app = express();
const authService = new AuthService();
const sessionController = new SessionController();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /me — current authenticated user
app.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await authService.getMe(req.userId!);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// Routes
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/lessons', lessonRoutes);
app.use('/bookings', bookingRoutes);
app.use('/sessions', sessionRoutes);
app.use('/llm', llmRoutes);

// GET /lessons/:id/sessions — list sessions for a lesson (mounted here for clean URL)
app.get('/lessons/:id/sessions', authMiddleware, sessionController.getByLesson);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
