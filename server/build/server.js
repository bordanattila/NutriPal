"use strict";
/**
 * @file server.js
 * @description Sets up Express server, GraphQL API via Apollo Server, session management with MongoDB, CORS, Helmet for security, and static file serving.
 * @routes RESTful endpoints (`/api`, `/user`) and GraphQL endpoint.
 */
const express = require('express');
const { authMiddleware } = require('./utils/auth');
const { ApolloServer } = require('apollo-server-express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const fs = require('fs');
// Load GraphQL schemas and database connection
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
// Set up Express
const app = express();
const PORT = process.env.PORT || 4000;
/**
 * @desc Sets secure headers using Helmet including custom content security policy
 * Applies strict Content Security Policy (CSP) headers to limit sources for scripts, styles, etc.
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://rsms.me", "'unsafe-inline'"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://kit.fontawesome.com"],
            fontSrc: ["'self'", "data:"],
            imgSrc: ["'self'", "data:", "https://platform.fatsecret.com"],
        },
    },
}));
/**
 * @desc Enables CORS for frontend origins and credentials.
 * Allows credentials (cookies) to be sent with requests.
 */
app.use(cors({
    origin: [process.env.CLIENT_URL, 'https://nutripal-hbcff5htezbqdwe9.canadacentral-01.azurewebsites.net'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));
// Built-in middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/**
 * @desc Configures session management using MongoDB
 * - Secure cookies in production
 * - Sessions expire after 1 day (maxAge)
 * - Sessions are stored in MongoDB with TTL = 14 days
 */
app.use(
// Set session options dynamically
session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        // Sets session expiration time in seconds (14 days)
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        // Session cookie max age in milliseconds (1 day)
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    }
}));
// Mount your API and user routes 
app.use('/api', require('./controllers/apiRoutes'));
app.use('/user', require('./controllers/userRoutes'));
/**
 * @desc Initializes Apollo Server with GraphQL schema and context
 * - Type definitions and resolvers for GraphQL
 * - Context function for JWT authentication
 * - Introspection and Playground enabled
 */
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    cache: 'bounded',
    introspection: true, //!isProduction, Disable introspection in production
    playground: true,
});
/**
 * @function startApolloServer
 * @description Starts Apollo Server and connects to MongoDB
 * Once the database connection is open, starts listening on the defined port.
 */
const startApolloServer = async (typeDefs, resolvers) => {
    await server.start();
    server.applyMiddleware({ app });
    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
        });
    });
};
// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
/**
 * @desc Serves static files from React build folder in production
 * - In production: serves from React build folder
 * - In development: serves from /public folder
 */
if (process.env.NODE_ENV === 'production') {
    console.log('Serving static files from:', path.join(__dirname, '../apps/web/build'));
    app.use(express.static(path.join(__dirname, '../apps/web/build')));
    // Create a route that will serve up the `../apps/web/build/index.html` page
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../apps.web/build', 'index.html'));
    });
}
else {
    app.use(express.static(path.join(__dirname, 'public')));
}
