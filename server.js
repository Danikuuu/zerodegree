const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profile');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const methodOverride = require('method-override');
const staffRoutes = require('./routes/staffRoutes');
const indexRoutes = require('./routes/indexRoutes');
const staffProcessRoutes = require('./routes/staffProcessRoutes');
const flash = require('connect-flash');
const kitchenRoutes = require('./routes/KitchenRoutes');
const multer = require('multer');
require('dotenv').config();
require('./passportConfig')
const path = require('path');


const app = express();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/staff', staffProcessRoutes);
app.use('/api/orders', orderRoutes);
app.use('/', profileRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', reviewRoutes);
app.use('/admin/staff', staffRoutes);
app.use('/', indexRoutes);
app.use('/kitchen', kitchenRoutes);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads'); 
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
