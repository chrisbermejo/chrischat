const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    username: String,
    email: String,
    password: String,
    picture: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;  