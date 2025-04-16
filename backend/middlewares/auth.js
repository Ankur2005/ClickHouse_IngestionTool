const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

module.exports = authenticate;