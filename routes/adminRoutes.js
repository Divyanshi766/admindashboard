const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/admin', authMiddleware, (req, res) => {
    res.render('dashboard/adminDashboard', { user: req.session.user });
});

module.exports = router;
