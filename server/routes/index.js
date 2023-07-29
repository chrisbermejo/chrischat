const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const User = require('../database/schemas/user');
const FriendList = require('../database/schemas/friendList');
const ConversationList = require('../database/schemas/conversationsList');

const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const uuidID = uuidv4();

    try {
        const user = new User({
            id: uuidID,
            username: username,
            email: email,
            password: password,
            picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        });

        const conversationList = new ConversationList({
            user: user._id,
            conversations: []
        });
        await conversationList.save();

        const friendList = new FriendList({
            user: user._id,
            friends: []
        });
        await friendList.save();

        user.conversationList = conversationList._id;
        user.friendList = friendList._id;

        await user.save();

        const accessToken = jwt.sign({ isLoggedIn: true, id: uuidID, username: username, picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET);

        // Set the refresh token as an HttpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days (example duration)
        });
        // Set the access token as an HttpOnly cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 1000 * 15 // 15 minutes (example duration)
        });

        res.status(201).send({ message: 'User created successfully', username: username, picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' });
    } catch (error) {
        res.status(400).send({ error, message: 'User not created' });
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    } else {
        const accessToken = jwt.sign({ isLoggedIn: true, id: user.id, username: user.username, picture: user.picture }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET);

        // Set the refresh token as an HttpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days (example duration)
        });

        // Set the access token as an HttpOnly cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 1000 * 15 // 15 minutes (example duration)
        });

        return res.status(200).send({ message: 'Login successful', username: user.username, picture: user.picture });
    }
});

router.post('/logout', async (req, res) => {
    // Clear both access token and refresh token cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).send({ message: 'Logout successful' });
});

module.exports = router;