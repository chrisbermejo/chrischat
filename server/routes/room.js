const express = require('express');
const router = express.Router();

const Room = require('../database/schemas/room');
const User = require('../database/schemas/user');
const Message = require('../database/schemas/message');

const jwt = require('jsonwebtoken');

require('dotenv').config()

const verifyAccessToken = async (req, res, next) => {
    const accesstoken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accesstoken && !refreshToken) {
        return; // If there's no access token and no refresh token, it means the user is not authenticated.
    }
    try {
        if (accesstoken) { // Verify the access token and proceed with the request if valid
            const decoded = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;
            return next();
        } else {
            // If the access token is not present, attempt to refresh it using the refresh token
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // Check if the refresh token corresponds to a valid user
            const user = await User.findById(decodedRefreshToken.userId);
            if (!user) {
                // If the user associated with the refresh token is not found, the user is not authenticated.
                return res.status(401).send({ message: 'Access Denied' });
            }
            // Generate a new access token
            const newAccessToken = jwt.sign({ isLoggedIn: true, username: user.username, picture: user.picture }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            // Set the new access token as an HttpOnly cookie
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 1000 * 15 // 15 minutes (example duration)
            });
            // Proceed with the request after refreshing the access token
            req.user = { isLoggedIn: true, username: user.username, picture: user.picture };
            return next();
        }
    } catch (error) {
        // If there's an error other than "TokenExpiredError", it means the access token or refresh token is invalid or tampered with.
        return res.status(401).send({ message: 'Access Denied' });
    }
};

router.post('/createRoom', async (req, res) => {
    const { name, id, user } = req.body;
    const newRoom = new Room({
        name: name,
        id: id,
        users: user
    });
    await newRoom.save();

    res.status(201).send({ message: 'Room created successfully' });
});

router.get('/api/user', verifyAccessToken, async (req, res) => {
    res.json({ username: req.user.username, picture: req.user.picture });
});

router.get('/api/room/:roomID/messages', verifyAccessToken, async (req, res) => {
    const roomID = req.params.roomID;
    const messages = await Message.find({ room: roomID }).select('-_id');
    res.json(messages);
});

router.get('/api/user/rooms', verifyAccessToken, async (req, res) => {
    const messages = await Room.find({ users: req.user.username });
    res.json(messages);
});

router.get('/api/user/:userID/profilePicture', verifyAccessToken, async (req, res) => {
    const userID = req.params.userID;
    const user = await User.findOne({ username: userID });
    res.json(user.picture);
});

module.exports = router;