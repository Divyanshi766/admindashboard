const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const userModel = require('../models/userModel');


const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'divyanshi1327@#$%^&*(HGVD';

exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
  const {email, password } = req.body;

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid email or password' });
    }

    const isMatch = verifyPassword(password, user.hash, user.salt);
    if (!isMatch) {
      return res.status(401).render('login', { error: 'Invalid email or password' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
    

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const isMatch = verifyPassword(password, user.hash, user.salt);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = { id: user.id, email: user.email, role: user.role };

    if (user.role.toLowerCase() === 'superadmin') {
      return res.redirect('/superadmin');
    } else if (user.role.toLowerCase() === 'admin') {
      return res.redirect('/admin');
    } else if (user.role.toLowerCase() === 'user') {
      return res.redirect('/user');
    }

    res.status(403).send('Role not recognized');
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Server error');
  }
};

exports.getRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.postRegister = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.render('register', { error: 'Email is already registered' });
    }

    const { salt, hash } = hashPassword(password);
    await userModel.create({ email, hash, salt, role });
    res.redirect('/login');
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).send('Server error');
  }
};

exports.getDashboard = (req, res) => {
    res.render('dashboard/dashboard', { user: req.user });
};

exports.createUser = async (req, res) => {
  const { email, password, role } = req.body;

 
  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).send('Invalid role');
  }

  try {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).send('Email is already taken');
    }
    const { salt, hash } = hashPassword(password);

   
    await userModel.create({ email, hash, salt, role });

    
    res.redirect('/admin-dashboard');  
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Server error');
  }
};

exports.superAdminDashboard = (req, res) => {
  res.render('dashboard/superAdminDashboard', { user: req.session.user });
};

exports.adminDashboard = (req, res) => {
  res.render('dashboard/adminDashboard', { user: req.session.user });
};

exports.userDashboard = (req, res) => {
  res.render('dashboard/userDashboard', { user: req.session.user });
};

exports.dashboard = (req, res) => {
  res.render('dashboard/dashboard');
};

exports.dashboard=(req,res)=>{
  res.render('dashboard/createUser');
}

