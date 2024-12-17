const express = require('express');
const session = require('express-session');
const routes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const path=require('path')
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));


const superadminRoutes = require('./routes/superadminRoutes');
app.use('/', superadminRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/', adminRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory)); 

const authRoutes=require('./routes/authRoutes');
app.use('/dashboard', authRoutes);



app.use('/', routes);
const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});