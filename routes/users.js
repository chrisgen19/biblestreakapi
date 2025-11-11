const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('address').optional().trim(),
  body('country').optional().trim(),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('birthday').optional().isISO8601().toDate().withMessage('Birthday must be a valid date'),
];

// GET /api/users - Get all users (protected)
router.get('/', authenticate, async (req, res) => {
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

// GET /api/users/:id - Get single user (protected)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

// PUT /api/users/:id - Update user (protected)
router.put('/:id', authenticate, updateValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, password, firstName, lastName, address, country, gender, birthday } = req.body;

    // Check if user is updating their own profile or is admin
    // For now, users can only update their own profile
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update data object
    const updateData = {};

    if (email) {
      // Check if email is already taken by another user
      const emailCheck = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: parseInt(id) },
        },
      });

      if (emailCheck) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      updateData.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (address !== undefined) updateData.address = address;
    if (country !== undefined) updateData.country = country;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
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
});

// DELETE /api/users/:id - Delete user (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is deleting their own profile or is admin
    // For now, users can only delete their own profile
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'You can only delete your own profile' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) },
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

module.exports = router;
