const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    id: String,
    user: String,
    message: String,
    date: String,
    time: String,
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;