const express = require('express');
const router = express.Router();
//const authMiddleware = require('../middleware/authMiddleware');

router.get('/superadmin', authMiddleware, (req, res) => {
    res.render('dashboard/superAdminDashboard', { user: req.session.user });
   
});

module.exports = router;
