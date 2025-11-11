const passport = require('passport');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error) {
      return res.status(500).json({ error: 'Authentication error', details: error.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authenticate;
