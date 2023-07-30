const express = require('express');
const router = express.Router();

const User = require('../database/schemas/user');
const Message = require('../database/schemas/message');
const Conversation = require('../database/schemas/conversations');
const FriendList = require('../database/schemas/friendList');

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()

const verifyAccessToken = async (req, res, next) => {
    const accesstoken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accesstoken && !refreshToken) {
        return res.status(401).send({ message: 'Access Denied' }); // If there's no access token and no refresh token, it means the user is not authenticated.
    }
    try {
        if (accesstoken) { // Verify the access token and proceed with the request if valid
            const decoded = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findOne({ username: decoded.username, picture: decoded.picture });
            req.user = user;
            // console.log(req.user)
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

router.get('/api/user', verifyAccessToken, async (req, res) => {
    res.status(200).json({ isLoggedIn: true, username: req.user.username, picture: req.user.picture });
});

router.get('/api/room/:roomID/messages', verifyAccessToken, async (req, res) => {
    const roomID = req.params.roomID;
    const messages = await Message.find({ room: roomID }).select('-_id');
    res.json(messages);
});

router.get('/api/user/rooms', verifyAccessToken, async (req, res) => {
    const conversations = await Conversation.find({ users: req.user._id }).populate('users', 'username picture');
    res.json(conversations);
});

router.get('/api/user/:userID/profilePicture', verifyAccessToken, async (req, res) => {
    const userID = req.params.userID;
    const user = await User.findOne({ _id: userID });
    res.json(user.picture);
});

router.post('/createConversation', verifyAccessToken, async (req, res) => {
    const { name, user } = req.body;
    const userID = [req.user._id];

    try {
        for (const e of user) {
            const id = await User.findOne({ username: e });
            if (id) {
                userID.push(id._id);
            }
        }

        const newConversation = new Conversation({
            isGroupChat: true,
            room: uuidv4(),
            name: name,
            users: userID,
            users_count: userID.length,
            picture: 'https://images-ext-1.discordapp.net/external/PNLH64xfgvwICQgUWi9Ugld5IIcTgs5fURgaeVjx0g4/https/pbs.twimg.com/media/F15M-yMXoAIcTFz.jpg?width=893&height=583',
        });

        await newConversation.save();

        res.status(201).send({ message: 'Conversation created successfully' });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).send({ error: 'An error occurred while creating the conversation' });
    }
});

router.post('/addFriend/:username', verifyAccessToken, async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Find the friend list of the current user
        const friendList = await FriendList.findOne({ user: req.user._id });

        // Check if the user is already a friend in the friend list
        const isFriend = friendList.friends.some((friend) => friend.user.equals(user._id));

        if (isFriend) {
            return res.status(400).send({ error: 'User is already a friend' });
        }

        const otherFriendList = await FriendList.findOne({ user: user._id });

        // Add the new friend to the friend list

        const list = {
            type: 'Outgoing',
            user: user._id,
            status: 'pending',
            sender: req.user._id,
            receiver: user._id,
        }

        friendList.friends.push(list);
        await friendList.save();

        list.user = req.user._id;
        list.type = 'Incoming';
        otherFriendList.friends.push(list);

        await otherFriendList.save();

        res.status(200).send({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send({ error: 'An error occurred while adding the friend' });
    }
});

router.get('/api/user/friendlist', verifyAccessToken, async (req, res) => {
    const friendList = await FriendList.findOne({ user: req.user._id }).populate('friends.user', 'username picture').populate('friends.sender', 'username');
    res.json(friendList.friends);
});

router.delete('/api/deleteRequest', verifyAccessToken, async (req, res) => {
    const body = req.body

    console.log(body);

    let senderFriendList = null;
    let receiverFriendList = null;

    try {
        if (body.type === 'Outgoing') {
            senderFriendList = await FriendList.findOne({ user: req.user._id });
            receiverFriendList = await FriendList.findOne({ user: body.receiver });
        } else if (body.type === 'Incoming') {
            senderFriendList = await FriendList.findOne({ user: body.sender });
            receiverFriendList = await FriendList.findOne({ user: req.user._id });
        }

        console.log(senderFriendList)
        console.log(receiverFriendList)


        res.status(200).send({ message: 'Declining friend request successfully' });
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).send({ error: 'An error occurred while declining friend request' });
    }
});

module.exports = router;