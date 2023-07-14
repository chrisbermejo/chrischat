const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    message: String,
    user: String
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;