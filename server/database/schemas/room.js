const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    id: String,
    name: String,
    users: Array,
    users_count: Number,
    picture: String
});

const Room = mongoose.model('rooms', RoomSchema);

module.exports = Room;