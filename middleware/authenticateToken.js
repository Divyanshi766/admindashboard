const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key';

module.exports = (req, res, next) => {
    
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); 
        req.user = decoded; 
        next(); 
    } catch (err) {
        console.error('Token Verification Error:', err);
        return res.status(403).send('Invalid Token');
    }
};
