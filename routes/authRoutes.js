const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const userModel = require('../models/userModel');
const { verifyPassword } = require('../utils/passwordUtils');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../configs/db');
const db = require('../configs/db');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = 'your_secret_key';

// Login route
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

       
        if (user.password !== password) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('user', user, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('role', user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.redirect('/dashboard');

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server error');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.clearCookie('role', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect('/login');
});


router.get('/createUser', authenticateToken, (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).send('Access denied');
    }
    res.render('dashboard/createUser');
});


router.post('/createUser', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).send('Access denied');
    }
    try {
        await authController.createUser(req.body);
        res.redirect('/dashboard/users');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

router.post('/api/users/create', authController.createUser);

router.get('/dashboard/roles', authenticateToken, async (req, res) => {
     if (req.user.role !== 'superadmin') {
        return res.status(403).send('Access denied');
    }
    try {
        const usersQuery = `SELECT u.id AS userId, u.Username, u.Email, r.RoleName AS Role 
                            FROM users u 
                            JOIN roles r ON u.role_id = r.RoleID`;

        const [usersWithRoles] = await pool.execute(usersQuery);

        const modulesQuery = `SELECT ModuleName FROM modules`;
        const [modules] = await pool.execute(modulesQuery);

        
        res.render('dashboard/roles', { users: usersWithRoles, modules });
    } catch (err) {
        console.error('Error fetching roles and users:', err.message);
        res.status(500).send('Internal server error');
    }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const modules = await userModel.getmodulesByUserid(req.cookies.user.id);
        const moduleNames = modules.map(module => module.ModuleName);
        
        res.render('dashboard/dashboard', { moduleNames });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Server error');
    }
});


router.get('/products', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.render('dashboard/products', { products: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data from database');
    }
});


router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.render('dashboard/categories', { categories: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data from database');
    }
});


router.get('/customers', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers');
        res.render('dashboard/customers', { customers: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data from database');
    }
});


router.get('/inventory', authenticateToken, async (req, res) => {
    try {
        res.render('dashboard/inventory', { user: req.user });
    } catch (error) {
        console.error('Error rendering inventory page:', error);
        res.status(500).send('Error loading inventory');
    }
});



router.post('/dashboard/insert-modules', authenticateToken, async (req, res) => {
    if (req.user.role.toLowerCase() !== 'superadmin') {
    return res.status(403).send('Access denied');
}

    console.log('Request Body:', req.body);  
    try {
        const { email, modules }= req.body;
        console.log('Email:', email);  
        console.log('Modules:', modules);  

       
        if (!modules || modules.length === 0) {
            console.log('No modules selected');
            return res.status(400).json({ success: false, message: 'No modules selected' });
        }

        
        const userQuery = `SELECT id FROM users WHERE Email = ?`;
        const [user] = await pool.execute(userQuery, [email]);

     if (!user || user.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
}
const userId = user[0].id;


        
       const moduleQuery = `SELECT moduleId, ModuleName FROM modules WHERE LOWER(ModuleName) IN (${modules.map(m => '?').join(",")})`;
      
       const [moduleRows] = await pool.execute(moduleQuery,[...modules.map((m) => m.toLowerCase())]);
     
        if (moduleRows.length !== modules.length) {
            return res.status(400).json({ success: false, message: 'Some modules are invalid' });
        }
        
        const moduleIds = moduleRows.map(row => row.moduleId);
        await pool.execute(`DELETE FROM usermodules WHERE userid = ?`, [userId]);

        
        const insertPromises = moduleIds.map(moduleId =>
            pool.execute(`INSERT INTO usermodules (userid, moduleid) VALUES (?, ?)`, [userId, moduleId])
        );
        try {
    await Promise.all(insertPromises);
} catch (err) {
    console.error('Error during module insertion:', err.message);
    return res.status(500).json({ success: false, message: 'Error updating modules' });
}


        return res.json({ success: true, message: 'Modules updated successfully' });
    }  catch (err) {
        console.error('Error updating modules:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
