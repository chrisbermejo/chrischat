const mongoose = require('mongoose');

const ConversationListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    conversations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    }]
});

const ConversationList = mongoose.model('ConversationList', ConversationListSchema);

module.exports = ConversationList;