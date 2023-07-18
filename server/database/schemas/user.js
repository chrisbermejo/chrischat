const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    picture: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;