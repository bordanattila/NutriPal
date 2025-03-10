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

// Set up database
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

// Set up Express
const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  cache: 'bounded',
  introspection: true, //!isProduction, Disable introspection in production
  playground: true,
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Preflight CORS Headers
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
//   res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(204); // No Content
//   }
//   next();
// });
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session middleware
// Middleware to set secure cookie based on request
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
  })
);

app.use('/', require('./controllers/'));

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Create a route that will serve up the `../client/build/index.html` page
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://rsms.me", "'unsafe-inline'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://kit.fontawesome.com"],
        fontSrc: ["'self'", "data:"],
        // Add other directives as needed
      },
    },
  })
);

// Start server
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);

