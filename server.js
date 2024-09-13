const express = require('express');
const { authMiddleware } = require('./utils/auth');
const bodyParser = require('body-parser');
const session = require('express-session');;
const indexRoutes = require('./controllers/index');
const foodRoutes = require('./controllers/api/index');
const foodSearch = require('./controllers/api/index');
// const { ApolloServer } = require('apollo-server-express');
const path = require('path');

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3000;
// const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: authMiddleware,
//     formatError: (error) => {
//       // Customize error formatting here
//       return error;
//     },
//     onError: (error) => {
//       // Log errors or perform other error handling tasks here
//       console.error(error);
//     },
// });

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
// app.use(express.static('public'))
// app.use('/', indexRoutes);
// app.use('/food', foodRoutes);
// app.use('/food/api', foodSearch);

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./controllers/'));

// Create a new instance of an Apollo server with the GraphQL schema
// const startApolloServer = async (typeDefs, resolvers) => {
//   await server.start();
//   server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  ;
  
// Call the async function to start the server
  // startApolloServer(typeDefs, resolvers);