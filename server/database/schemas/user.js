const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    user: String,
    password: String
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;