const express = require('express');
const router = express.Router();

const Room = require('../database/schemas/room');

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

router.get('/messages/room/:roomID', async (req, res) => {
    const roomID = req.params.roomID;
    const messages = await Message.find({ room: roomID });
    res.json(messages);
});

router.get('/room/:userID', async (req, res) => {
    const userID = req.params.userID;
    const messages = await Room.find({ 'users.user': userID });
    res.json(messages);
});

module.exports = router;