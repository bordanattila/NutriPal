const express = require('express');
const { authMiddleware } = require('./utils/auth');
const bodyParser = require('body-parser');
const session = require('express-session');;
const path = require('path');
const ejs = require('ejs');

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', "ejs");
console.log(app.get('view engine'));
app.set('views', './public/views');

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./controllers/'));

app.use((req, res, next) => {
  console.log('Registered Routes:');
  console.log(app._router.stack
    .filter(layer => layer.route)
    .map(layer => layer.route.path)
    .join('\n'));
  next();
});

app.use((req, res, next) => {
  console.log(`Request to ${req.url}`);
  next();
});
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  })
})
  ;
