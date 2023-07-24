const jwt = require('jsonwebtoken');

module.exports = function verifyToken(token, secret) {
    return jwt.verify(token, secret);
};