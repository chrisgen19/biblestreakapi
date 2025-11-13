/**
 * Custom type definitions for the Bible Streak API
 */

import { User } from '@prisma/client';

/**
 * JWT payload structure
 * Contains the minimal information needed to identify a user from a token
 */
export interface JwtPayload {
  /**
   * The unique identifier of the authenticated user
   */
  id: number;

  /**
   * The email address of the authenticated user
   */
  email: string;

  /**
   * Token issued at timestamp (automatically added by jsonwebtoken)
   */
  iat?: number;

  /**
   * Token expiration timestamp (automatically added by jsonwebtoken)
   */
  exp?: number;
}

/**
 * User object without sensitive information (password excluded)
 * Used for API responses where we don't want to expose the hashed password
 */
export type PublicUser = Omit<User, 'password'>;

/**
 * Authentication response structure
 * Returned by login and register endpoints
 */
export interface AuthResponse {
  /**
   * JWT access token for authenticated requests
   * Valid for 7 days
   */
  token: string;

  /**
   * User information without password
   */
  user: PublicUser;
}

/**
 * Standard API error response
 */
export interface ErrorResponse {
  /**
   * Human-readable error message
   */
  error: string;

  /**
   * Optional array of validation errors
   * Present when request validation fails
   */
  errors?: Array<{
    /**
     * The field that failed validation
     */
    field?: string;

    /**
     * The validation error message
     */
    message: string;

    /**
     * The type of validation that failed
     */
    type?: string;

    /**
     * The value that failed validation
     */
    value?: unknown;
  }>;
}

/**
 * User registration request body
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string; // ISO date string
}

/**
 * User login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * User update request body
 * All fields are optional as users can update selectively
 */
export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string; // ISO date string
}

/**
 * Standard success response wrapper
 */
export interface SuccessResponse<T> {
  /**
   * Success message
   */
  message: string;

  /**
   * Response data payload
   */
  data?: T;
}
