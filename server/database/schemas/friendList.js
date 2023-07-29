const mongoose = require('mongoose');

const FriendListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    friends: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
    }],
});


const FriendList = mongoose.model('FriendList', FriendListSchema);

module.exports = FriendList;
