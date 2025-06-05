const express = require('express');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

// Set EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../view'));

// Static
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Welcome to Vercel Express App' });
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
