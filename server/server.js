const express = require('express');
const { authMiddleware } = require('./utils/auth');
const { ApolloServer } = require('apollo-server-express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Set up database
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

// Set up Express
const app = express();
const PORT = process.env.PORT || 3000;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(cors({
  origin: 'https://nutripal-83c0f3f97ebb.herokuapp.com',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session middleware
const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: isHttps, sameSite: 'lax' } 
}));

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
 
