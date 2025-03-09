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

// Set up database
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

// Set up Express
const app = express();
const PORT = process.env.PORT || 4000;

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  cache: 'bounded',
  introspection: true, //!isProduction, Disable introspection in production
  playground: true,
});

app.use(cors({
  origin: [process.env.CLIENT_URL, 'https://nutripal-hbcff5htezbqdwe9.canadacentral-01.azurewebsites.net'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
 
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


// // Serve static files from the React app
// if (process.env.NODE_ENV === 'production') {
//   console.log('Serving static files from:', path.join(__dirname, '../client/build'));
//   app.use(express.static(path.join(__dirname, '../client/build')));
  
//   // Create a route that will serve up the `../client/build/index.html` page
//   app.get('*', (req, res) => {
//     console.log('Catch-all route hit, serving index.html');
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
//   });
// } else {
//   app.use(express.static(path.join(__dirname, 'public')));
// }

if (process.env.NODE_ENV === 'production') {
  // Try multiple possible build paths
  const possiblePaths = [
    path.join(__dirname, '../client/build'),
    path.join(__dirname, './client/build'),
    path.join(__dirname, '../../client/build'),
    path.join(__dirname, 'client/build')
  ];
  
  let buildPath = null;
  
  // Log the current directory and possible paths for debugging
  console.log('Current directory:', __dirname);
  console.log('Checking possible build paths...');
  
  for (const testPath of possiblePaths) {
    console.log(`Testing path: ${testPath}`);
    try {
      if (fs.existsSync(testPath)) {
        console.log(`Path exists: ${testPath}`);
        const files = fs.readdirSync(testPath);
        console.log(`Files in ${testPath}:`, files);
        
        if (files.includes('index.html')) {
          buildPath = testPath;
          console.log(`Found valid build path: ${buildPath}`);
          break;
        }
      }
    } catch (err) {
      console.log(`Error checking path ${testPath}:`, err.message);
    }
  }
  
  if (buildPath) {
    console.log(`Serving static files from: ${buildPath}`);
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      console.log('Catch-all route hit, serving index.html');
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.log('WARNING: Could not find client build directory');
    app.get('*', (req, res) => {
      res.status(500).send('Server configuration error: Client build directory not found. Check logs for details.');
    });
  }
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

app.use('/api', require('./controllers/'));

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

