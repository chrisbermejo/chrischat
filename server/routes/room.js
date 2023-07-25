const express = require('express');
const router = express.Router();

const Room = require('../database/schemas/room');
const User = require('../database/schemas/user');

const verifyTokenFunction = require('../verifyToken');

require('dotenv').config()

router.post('/createRoom', async (req, res) => {
    const { name, id, user } = req.body;
    const newRoom = new Room({
        name: name,
        id: id,
        users: user
    });
    await newRoom.save();

    res.status(201).send({ message: 'User created successfully' });
});

const Message = require('../database/schemas/message');


const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = verifyTokenFunction(token, process.env.SECRET_WORD);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).send({ message: 'Access Denied' });
        }
    } else {
        return res.status(401).send({ message: 'Access Denied' });
    }
};

router.get('/api/user', verifyToken, async (req, res) => {
    res.json({ username: req.user.username, picture: req.user.picture })
});

//fetches messages from room id
router.get('/api/room/:roomID/messages', verifyToken, async (req, res) => {
    const roomID = req.params.roomID;
    const messages = await Message.find({ room: roomID }).select('-_id');
    res.json(messages);
});

//fetches rooms from user id
router.get('/api/user/rooms', verifyToken, async (req, res) => {
    const messages = await Room.find({ users: req.user.username });
    res.json(messages);
});

//fetches profile picture from user id
router.get('/api/user/:userID/profilePicture', verifyToken, async (req, res) => {
    const userID = req.params.userID;
    const messages = await User.findOne({ username: userID })
    res.json(messages.picture);
});

module.exports = router;