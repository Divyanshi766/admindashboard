const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key'; 

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is not valid' });
        }
    
        req.user = user;  
        next();  
    });
};

module.exports = authenticateToken;
