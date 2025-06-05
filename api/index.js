const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');
const serverless = require('serverless-http');
require('dotenv').config();
require('../passportConfig');

// Routes
const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');
const profileRoutes = require('../routes/profile');
const orderRoutes = require('../routes/orderRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const staffRoutes = require('../routes/staffRoutes');
const indexRoutes = require('../routes/indexRoutes');
const staffProcessRoutes = require('../routes/staffProcessRoutes');
const kitchenRoutes = require('../routes/KitchenRoutes');

const app = express();

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Views and static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/staff', staffProcessRoutes);
app.use('/api/orders', orderRoutes);
app.use('/', profileRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', reviewRoutes);
app.use('/admin/staff', staffRoutes);
app.use('/', indexRoutes);
app.use('/kitchen', kitchenRoutes);

module.exports = app;
module.exports.handler = serverless(app);
