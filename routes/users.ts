/// <reference path="../types/express.d.ts" />

import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult, ValidationChain } from 'express-validator';
import prisma from '../config/prisma';
import authenticate from '../middleware/auth';
import { UpdateUserRequest } from '../types';
import { Prisma } from '@prisma/client';

const router: Router = express.Router();

/**
 * Validation rules for user update
 * All fields are optional since users can update selectively
 */
const updateValidation: ValidationChain[] = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
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
 * GET /api/users
 * Get all users (protected route)
 *
 * @route GET /api/users
 * @access Protected - Requires JWT authentication
 * @returns 200 - List of all users (without passwords)
 * @returns 500 - Server error while fetching users
 */
router.get('/', authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
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
        // Password explicitly excluded from selection
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID (protected route)
 *
 * @route GET /api/users/:id
 * @access Protected - Requires JWT authentication
 * @param id - User ID (integer)
 * @returns 200 - User data (without password)
 * @returns 404 - User not found
 * @returns 500 - Server error while fetching user
 */
router.get('/:id', authenticate, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
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
        // Password explicitly excluded from selection
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile (protected route)
 *
 * @route PUT /api/users/:id
 * @access Protected - Requires JWT authentication, users can only update their own profile
 * @param id - User ID (integer)
 * @param req.body - UpdateUserRequest with fields to update
 * @returns 200 - User updated successfully
 * @returns 400 - Validation error, email already in use, or no fields to update
 * @returns 403 - User attempting to update another user's profile
 * @returns 404 - User not found
 * @returns 500 - Server error while updating user
 */
router.put(
  '/:id',
  authenticate,
  updateValidation,
  async (req: Request<{ id: string }, {}, UpdateUserRequest>, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { email, password, firstName, lastName, address, country, gender, birthday } = req.body;

      // Authorization check: users can only update their own profile
      // req.user is populated by authenticate middleware
      if (!req.user || req.user.id !== parseInt(id, 10)) {
        res.status(403).json({ error: 'You can only update your own profile' });
        return;
      }

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!userExists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Build update data object dynamically
      // Using Prisma.UserUpdateInput ensures type safety for the update operation
      const updateData: Prisma.UserUpdateInput = {};

      if (email !== undefined) {
        // Check if email is already taken by another user
        const emailCheck = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: parseInt(id, 10) },
          },
        });

        if (emailCheck) {
          res.status(400).json({ error: 'Email already in use' });
          return;
        }

        updateData.email = email;
      }

      if (password !== undefined) {
        // Hash new password with bcrypt
        const salt: string = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      // Update other fields if provided
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (address !== undefined) updateData.address = address;
      if (country !== undefined) updateData.country = country;
      if (gender !== undefined) updateData.gender = gender;
      if (birthday !== undefined) updateData.birthday = new Date(birthday);

      // Ensure at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      // Perform the update
      const user = await prisma.user.update({
        where: { id: parseInt(id, 10) },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          address: true,
          country: true,
          gender: true,
          birthday: true,
          updatedAt: true,
          // Password explicitly excluded from response
        },
      });

      res.json({
        message: 'User updated successfully',
        user,
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Server error while updating user' });
    }
  }
);

/**
 * DELETE /api/users/:id
 * Delete user account (protected route)
 *
 * @route DELETE /api/users/:id
 * @access Protected - Requires JWT authentication, users can only delete their own account
 * @param id - User ID (integer)
 * @returns 200 - User deleted successfully
 * @returns 403 - User attempting to delete another user's account
 * @returns 404 - User not found
 * @returns 500 - Server error while deleting user
 */
router.delete('/:id', authenticate, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Authorization check: users can only delete their own profile
    // req.user is populated by authenticate middleware
    if (!req.user || req.user.id !== parseInt(id, 10)) {
      res.status(403).json({ error: 'You can only delete your own profile' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: { id: true, email: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});

export default router;
