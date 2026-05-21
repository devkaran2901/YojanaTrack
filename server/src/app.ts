import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';
import { authRouter } from './features/auth/auth.routes';
import { schemeRouter } from './features/schemes/scheme.routes';
import { bookmarksRouter } from './features/bookmarks/bookmarks.routes';
import { trackerRouter } from './features/tracker/tracker.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(globalLimiter);

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/schemes', schemeRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/tracker', trackerRouter);

// Error handler
app.use(errorHandler);

export { app };
