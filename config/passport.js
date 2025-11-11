const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('./database');
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [payload.id]);

    if (result.rows.length > 0) {
      return done(null, result.rows[0]);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

module.exports = (passport) => {
  passport.use(jwtStrategy);
};
