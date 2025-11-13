import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
import { PassportStatic } from 'passport';
import prisma from './prisma';
import { JwtPayload } from '../types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT Strategy configuration options
 * Extracts JWT from Authorization header as Bearer token
 */
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

/**
 * JWT Strategy implementation
 * Verifies JWT payload and retrieves user from database
 *
 * @param payload - The decoded JWT payload containing user ID
 * @param done - Passport callback function for verification result
 *
 * Returns user object (without password) if found, false if not found
 */
const jwtStrategy = new JwtStrategy(
  options,
  async (payload: JwtPayload, done: VerifiedCallback): Promise<void> => {
    try {
      // Fetch user from database using ID from JWT payload
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          address: true,
          country: true,
          gender: true,
          birthday: true,
          createdAt: true,
          updatedAt: true,
          // Explicitly exclude password from selection
        },
      });

      if (user) {
        // User found - authentication successful
        return done(null, user);
      } else {
        // User not found - authentication failed
        return done(null, false);
      }
    } catch (error) {
      // Database or other error occurred
      return done(error as Error, false);
    }
  }
);

/**
 * Initialize Passport with JWT strategy
 *
 * @param passport - The Passport instance to configure
 * @returns void
 *
 * This function configures Passport to use JWT-based authentication
 * for protecting API routes
 */
export default (passport: PassportStatic): void => {
  passport.use(jwtStrategy);
};
