const jwt = require('jsonwebtoken');
require('dotenv').config();

// Set token expiration date
const secret = process.env.TOKEN_SECRET;

module.exports = {
  // Function for our authenticated routes
  authMiddleware: function ({ req }) {
    // Allows token to be sent via  req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // Verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { algorithm: 'HS256', expiresIn: '15m' });
      req.user = data;
    } catch {
      console.log('Invalid token', err);
    }
    return req;
  },
  // Refresh token
  refreshToken: function (user) {
    const payload = { userId: user._id };
    return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' });
  },
  // Verify refresh token
  verifyRefreshToken: function (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, { algorithm: 'HS256' }, (err, payload) => {
        if (err) return reject(err);
        // Resolve with payload, which includes userId
        resolve(payload);  
      });
    });
  },
  signInToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { algorithm: 'HS256', expiresIn: '15m' });
  },
};