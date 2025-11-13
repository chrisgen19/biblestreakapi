import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult, ValidationChain } from 'express-validator';
import prisma from '../config/prisma';
import { RegisterRequest, LoginRequest } from '../types';

const router: Router = express.Router();

/**
 * Validation rules for user registration
 * Ensures all required fields are present and properly formatted
 */
const registerValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('address')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('birthday')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Birthday must be a valid date'),
];

/**
 * Validation rules for user login
 * Ensures email and password are provided
 */
const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * POST /api/auth/register
 * Register a new user account
 *
 * @route POST /api/auth/register
 * @param req.body - RegisterRequest containing user registration data
 * @returns 201 - User registered successfully with JWT token
 * @returns 400 - Validation error or user already exists
 * @returns 500 - Server error during registration
 */
router.post(
  '/register',
  registerValidation,
  async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, firstName, lastName, address, country, gender, birthday } = req.body;

      // Check if user already exists
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        res.status(400).json({ error: 'User already exists with this email' });
        return;
      }

      // Hash password with bcrypt
      // Salt rounds: 10 provides a good balance between security and performance
      const salt: string = await bcrypt.genSalt(10);
      const hashedPassword: string = await bcrypt.hash(password, salt);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          address: address || null,
          country: country || null,
          gender: gender || null,
          birthday: birthday ? new Date(birthday) : null,
        },
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
          // Explicitly exclude password from response
        },
      });

      // Generate JWT token with user ID and email
      // Token expires in 7 days
      const token: string = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 *
 * @route POST /api/auth/login
 * @param req.body - LoginRequest containing email and password
 * @returns 200 - Login successful with JWT token and user data
 * @returns 400 - Validation error
 * @returns 401 - Invalid credentials
 * @returns 500 - Server error during login
 */
router.post(
  '/login',
  loginValidation,
  async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Find user by email (need password for verification)
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Return generic error to prevent email enumeration
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password using bcrypt
      const isMatch: boolean = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // Return same generic error for consistency
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT token with user ID and email
      // Token expires in 7 days
      const token: string = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data without password
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          country: user.country,
          gender: user.gender,
          birthday: user.birthday,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

export default router;
