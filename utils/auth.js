const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: async function ({req}) {
    // Check if the request is a login request
    if (req.method === 'POST' && req.url === '/login') {
      const { username, password } = req.body;
      // Verify the credentials (e.g., check against a database or a user store)
      const user = await verifyCredentials(username, password);
      if (!user) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }
      // Generate a token for the user
      const token = signInToken({ username, email: user.email, _id: user._id });
      return res.json({ token });
    }

    // Rest of the authMiddleware function remains the same
    let token = req.body.token || req.query.token || req.headers.authorization;
    // ...
  },
  signInToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
