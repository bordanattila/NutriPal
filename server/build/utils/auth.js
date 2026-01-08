"use strict";
/**
 * @file auth.js
 * @description Provides JWT-based authentication utilities including middleware, token creation, refresh token handling, and verification.
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Set token expiration date
const secret = process.env.TOKEN_SECRET;
module.exports = {
    /**
     * @function authMiddleware
     * @description Verifies JWT from request headers/query/body and attaches decoded user data to request object.
     * @param {Object} context - The context object passed into ApolloServer (containing the request).
     * @returns {Object} The modified request with the user info attached if authenticated.
     */
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
        }
        catch {
            console.log('Invalid token', err);
        }
        return req;
    },
    /**
     * @function refreshToken
     * @description Creates a refresh token for the user.
     * @param {Object} user - User object containing `_id`.
     * @returns {string} A new refresh token (1 hour expiration).
     */
    refreshToken: function (user) {
        const payload = { userId: user._id };
        return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' });
    },
    /**
     * @function verifyRefreshToken
     * @description Verifies a refresh token.
     * @param {string} token - The refresh token to verify.
     * @returns {Promise<Object>} The decoded token payload.
     */
    verifyRefreshToken: function (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, { algorithm: 'HS256' }, (err, payload) => {
                if (err)
                    return reject(err);
                // Resolve with payload, which includes userId
                resolve(payload);
            });
        });
    },
    /**
     * @function signInToken
     * @description Signs a short-lived JWT for the user.
     * @param {Object} user - User object containing username, email, and _id.
     * @returns {string} A signed JWT valid for 15 minutes.
     */
    signInToken: function ({ username, email, _id }) {
        const payload = { username, email, _id };
        return jwt.sign({ data: payload }, secret, { algorithm: 'HS256', expiresIn: '15m' });
    },
};
