const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const passportConfig = require('./config/passport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Initialize Passport
app.use(passport.initialize());
passportConfig(passport);

// Routes
app.get('/', (req, res) => {
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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});

module.exports = app;
