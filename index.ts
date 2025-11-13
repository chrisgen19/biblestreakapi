import express, { Application, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import passport from 'passport';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import passportConfig from './config/passport';

// Load environment variables from .env file
dotenv.config();

/**
 * Express application instance
 */
const app: Application = express();

/**
 * Middleware Configuration
 */

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

/**
 * Debug middleware - logs all incoming requests
 * Useful for development and troubleshooting
 *
 * @param req - Express request object
 * @param _res - Express response object (unused but required by Express signature)
 * @param next - Express next function
 */
app.use((req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

/**
 * Initialize Passport for JWT authentication
 */
app.use(passport.initialize());
passportConfig(passport);

/**
 * Root endpoint - API documentation
 *
 * @route GET /
 * @returns API information and available endpoints
 */
app.get('/', (_req: Request, res: Response): void => {
  res.json({
    message: 'Bible Streak API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      users: {
        getAll: 'GET /api/users (protected)',
        getOne: 'GET /api/users/:id (protected)',
        update: 'PUT /api/users/:id (protected)',
        delete: 'DELETE /api/users/:id (protected)',
      },
    },
  });
});

/**
 * Mount route handlers
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

/**
 * 404 handler for undefined routes
 *
 * @param _req - Express request object (unused but required by Express signature)
 * @param res - Express response object
 */
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Global error handler
 * Catches any errors that occur during request processing
 *
 * @param err - Error object
 * @param _req - Express request object (unused but required by Express signature)
 * @param res - Express response object
 * @param _next - Express next function (unused but required by Express signature)
 */
const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
};

app.use(errorHandler);

/**
 * Server port configuration
 * Defaults to 5000 if PORT environment variable is not set
 */
const PORT: number = parseInt(process.env.PORT || '5000', 10);

/**
 * Start the Express server
 */
app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});

export default app;
