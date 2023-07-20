const express = require('express');
const router = express.Router();

const Room = require('../database/schemas/room');
const User = require('../database/schemas/user');

router.post('/createRoom', async (req, res) => {
    const { name, id, user } = req.body;
    const newRoom = new Room({
        name: name,
        id: id,
        users: user
    });
    console.log(newRoom)
    await newRoom.save();

    res.status(201).send({ message: 'User created successfully' });
});

const Message = require('../database/schemas/message');


//fetches messages from room id
router.get('/api/room/:roomID/messages', async (req, res) => {
    const roomID = req.params.roomID;
    const messages = await Message.find({ room: roomID }).select('-_id');
    res.json(messages);
});


//fetches rooms from user id
router.get('/api/user/:userID/rooms', async (req, res) => {
    const userID = req.params.userID;
    const messages = await Room.find({ users: userID });
    res.json(messages);
});

router.get('/api/user/:userID/profilePicture', async (req, res) => {
    const userID = req.params.userID;
    const messages = await User.findOne({ username: userID })
    res.json(messages.picture);
});

module.exports = router;