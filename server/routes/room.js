const express = require('express');
const router = express.Router();

const User = require('../database/schemas/user');
const Message = require('../database/schemas/message');
const Conversation = require('../database/schemas/conversations');
const FriendList = require('../database/schemas/friendList');

const pool = require('../database/PostgreSQL');

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
            const selectUserQuery = `
                SELECT username, picture FROM users
                WHERE username = $1
                LIMIT 1
            `;
            const result = await pool.query(selectUserQuery, [decoded.username]);
            req.user = result.rows[0];
            return next();
        } else {
            // If the access token is not present, attempt to refresh it using the refresh token
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // Check if the refresh token corresponds to a valid user
            const selectUserQuery = `
                SELECT username, picture FROM users
                WHERE userid = $1
                LIMIT 1
            `;
            const result = await pool.query(selectUserQuery, [decodedRefreshToken.userid]);
            const user = result.rows[0];
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
    const conversationID = req.params.roomID;

    const selectMessageQuery = `
        SELECT chatid, username, message, date, time FROM messages
        WHERE chatid = $1
    `;
    const result = await pool.query(selectMessageQuery, [conversationID]);
    const conversationMessages = result.rows;

    res.json(conversationMessages);
});

router.get('/api/user/rooms', verifyAccessToken, async (req, res) => {
    const selectChatQuery = `
        SELECT DISTINCT
            c.chatid,
            c.type,
            CASE
                WHEN c.type = 'group' THEN c.group_name
                WHEN c.type = 'private' THEN
                    CASE
                        WHEN u.username = $1 THEN u2.username
                        ELSE u.username
                    END
                ELSE NULL -- Handle other types if needed
            END AS chat_name,
            CASE
                WHEN c.type = 'group' THEN c.group_picture
                WHEN c.type = 'private' THEN
                    CASE
                        WHEN u.username = $1 THEN u2.picture
                        ELSE u.picture
                    END
                ELSE NULL -- Handle other types if needed
            END AS chat_picture,
            c.participants_count,
            c.recentmessagedate
        FROM chats AS c
        JOIN userchatrelationship AS ucr ON c.chatid = ucr.chatid
        JOIN users AS u ON ucr.userid = u.userid
        LEFT JOIN userchatrelationship AS ucr2 ON c.chatid = ucr2.chatid AND ucr.userid != ucr2.userid
        LEFT JOIN users AS u2 ON ucr2.userid = u2.userid
        WHERE u.username = $1;
    `;
    const result = await pool.query(selectChatQuery, [req.user.username]);
    const conversations = result.rows;
    res.json(conversations);
});

router.get('/api/user/:userID/profilePicture', verifyAccessToken, async (req, res) => {
    const userID = req.params.userID;
    const user = await User.findOne({ _id: userID });
    res.json(user.picture);
});

router.post('/createConversation', verifyAccessToken, async (req, res) => {
    const { name, users } = req.body;

    try {

        const chatid = uuidv4();

        //GROUP QUERY
        const insertUserQuery = `
            INSERT INTO chats ( chatid, type, group_name, group_picture, participants_count, recentmessagedate)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `;
        await pool.query(
            insertUserQuery,
            [chatid, 'group', name, 'https://images-ext-1.discordapp.net/external/PNLH64xfgvwICQgUWi9Ugld5IIcTgs5fURgaeVjx0g4/https/pbs.twimg.com/media/F15M-yMXoAIcTFz.jpg?width=893&height=583', user.length]
        );

        //PRIVATE QUERY
        // const insertUserQuery = `
        //     INSERT INTO chats ( chatid, type, participants_count, recentmessagedate)
        //     VALUES ($1, $2, $3, NOW())
        // `;
        // await pool.query(
        //     insertUserQuery,
        //     [chatid, 'private', users.length]
        // );

        for (const e of users) {
            const selectUserID = ` SELECT userid FROM users WHERE username = $1;`;
            const resultUserID = await pool.query(selectUserID, [e]);
            const insertUserChatQuery = `
                INSERT INTO userchatrelationship ( userid, chatid)
                VALUES ($1, $2)
            `;
            await pool.query(insertUserChatQuery, [resultUserID.rows[0].userid, chatid]);
        }

        res.status(201).send({ message: 'Conversation created successfully' });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).send({ error: 'An error occurred while creating the conversation' });
    }
});

router.post('/addFriend/:username', verifyAccessToken, async (req, res) => {

    const sender = req.user.username;
    const receiver = req.params.username;

    try {

        const selectRelationshipQuery = `
            SELECT sender_id, receiver_id, status FROM useruserrelationship
            WHERE sender_id = $1 AND receiver_id = $2 OR sender_id = $2 AND receiver_id = $1
            LIMIT 1
        `;
        const result = await pool.query(selectRelationshipQuery, [sender, receiver]);
        if (result.rows > 0 && result.rows[0].status === 'friends') {
            res.status(401).send({ message: 'Already friends with the user' });
        } else if (result.rows > 0 && result.rows[0].status === 'pending') {
            res.status(401).send({ message: 'Friend Request already sent' });
        } else {
            const insertRelationshipQuery = `
                INSERT INTO useruserrelationship (sender_id, receiver_id, status)
                VALUES ($1, $2, $3)
                RETURNING id 
            `;
            await pool.query(insertRelationshipQuery, [sender, receiver, 'pending']);

            res.status(200).send({ message: 'Friend request sent successfully' });
        }
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

        res.status(200).send({ message: 'Declining friend request successfully' });
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).send({ error: 'An error occurred while declining friend request' });
    }
});

module.exports = router;