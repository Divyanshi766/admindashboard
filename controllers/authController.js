const nodemailer = require('nodemailer');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret_key';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });
};

exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

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
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
};

exports.createUser = async (req, res) => {
  const { email, username, password, role } = req.body;

  console.log('Received data for user creation:', req.body);

  if (!email || !username || !password || !role) {
    return res.status(400).send('All fields are required');
  }

  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).send('Invalid role');
  }

  try {
    const { hash } = hashPassword(password);
    await userModel.createUser({ email, username, password: password, role });

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: email, 
      subject: 'Welcome to Our Platform', 
      text: `Hello ${username},\n\nYour account has been successfully created. You are now an ${role}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

  res.redirect('/createUser');
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Server error');
  }
};

exports.getUsersWithRoles = async (req, res) => {
  try {
    const users = await userModel.getUsersWithRoles();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// exports.getModulesByRoleId = async (req, res) => {
//   try {
//     const { roleId } = req.params;
//     const modules = await userModel.getModulesByRoleId(roleId);
//     res.status(200).json(modules);
//   } catch (error) {
//     console.error('Error fetching modules:', error);
//     res.status(500).json({ message: 'Error fetching modules' });
//   }
// };

