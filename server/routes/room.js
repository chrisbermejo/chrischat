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

router.get('/messages', async (req, res) => {
    const messages = await Message.find();
    res.json(messages);
});

module.exports = router;