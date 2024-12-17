const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user', authMiddleware, (req, res) => {
    res.render('dashboard/userDashboard', { user: req.session.user });
});

module.exports = router;
