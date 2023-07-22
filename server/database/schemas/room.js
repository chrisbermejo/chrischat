const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    id: String,
    name: String,
    users: Array,
    users_count: Number,
    picture: String,
    mostRecentMessageDate: {
        type: String,
        default: new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        }),
    }
});

const Room = mongoose.model('rooms', RoomSchema);

module.exports = Room;