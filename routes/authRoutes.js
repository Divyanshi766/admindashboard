const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const userModel = require('../models/userModel');
const { verifyPassword } = require('../utils/passwordUtils');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = 'your_secret_key';


router.get('/login', (req, res) => {
    res.render('login', { error: null });
});


router.post('/login', async (req, res) => {
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

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });

        res.cookie('role', user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });
    
        switch (user.role.toLowerCase()) {
            case 'superadmin':
                return res.redirect('/superadmin');
            case 'admin':
                return res.redirect('/admin');
            case 'user':
                return res.redirect('/user');
            default:
                return res.render('login', { error: 'Unauthorized role' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server error');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect('/login');
});

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

let categories = [];
router.get('/categories', authenticateToken, (req, res) => {
    res.render('dashboard/categories', { categories });
});

let customers = [];
router.get('/customers', authenticateToken, (req, res) => {
    res.render('dashboard/customers', { customers });
});

let inventory = [];
router.get('/inventory', authenticateToken, (req, res) => {
    res.render('dashboard/inventory', { inventory });
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard/dashboard', { categories });
});

let products = [];
router.get('/products', authenticateToken, (req, res) => {
    res.render('dashboard/products', { products });
});

router.get('/dashboard', authenticateToken, authController.getDashboard);

module.exports = router;
