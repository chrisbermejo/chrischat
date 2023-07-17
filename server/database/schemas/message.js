const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    user: String,
    message: String,
    date: Date,
    time: String,
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;