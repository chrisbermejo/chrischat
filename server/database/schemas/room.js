const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    id: String,
    name: String,
    users: Array
});

const Room = mongoose.model('rooms', RoomSchema);

module.exports = Room;