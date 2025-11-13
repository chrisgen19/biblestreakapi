import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '../types/express';

/**
 * Authentication middleware using JWT strategy
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 *
 * Validates JWT token from Authorization header.
 * On success: attaches user object to req.user and calls next()
 * On failure: returns 401 Unauthorized response
 * On error: returns 500 Internal Server Error response
 */
const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate(
    'jwt',
    { session: false },
    (error: Error | null, user: AuthenticatedUser | false, _info: { message?: string } | undefined): void => {
      // Handle authentication errors (database errors, JWT verification errors, etc.)
      if (error) {
        res.status(500).json({
          error: 'Authentication error',
          details: error.message,
        });
        return;
      }

      // Handle authentication failure (invalid token, expired token, user not found)
      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
        return;
      }

      // Authentication successful - attach user to request and continue
      req.user = user;
      next();
    }
  )(req, res, next);
};

export default authenticate;
