const express = require('express');
const router = express.Router();

const pool = require('../database/PostgreSQL');

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()

const verifyAccessToken = async (req, res, next) => {
    const accesstoken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accesstoken && !refreshToken) {
        req.user = { isLoggedIn: false, username: false, picture: false };
        return next();
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
            req.user = { isLoggedIn: true, username: result.rows[0].username, picture: result.rows[0].picture }
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
    res.status(200).json(req.user);
});

router.get('/api/room/:roomID/messages', verifyAccessToken, async (req, res) => {
    const conversationID = req.params.roomID;
    const date = req.query.date;

    let conversationMessages = null;

    if (date) {
        const selectMessageQuery = `
            SELECT chatid, username, message, date, time FROM messages
            WHERE chatid = $1 AND date < $2
        `;
        const result = await pool.query(selectMessageQuery, [conversationID, date]);
        conversationMessages = result.rows;
    } else {
        const selectMessageQuery = `
            SELECT chatid, username, message, date, time FROM messages
            WHERE chatid = $1
        `;
        const result = await pool.query(selectMessageQuery, [conversationID]);
        conversationMessages = result.rows;
    }

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
                ELSE NULL
            END AS chat_name,
            CASE
                WHEN c.type = 'group' THEN c.group_picture
                WHEN c.type = 'private' THEN
                    CASE
                        WHEN u.username = $1 THEN u2.picture
                        ELSE u.picture
                    END
                ELSE NULL
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

// router.get('/api/user/:userID/profilePicture', verifyAccessToken, async (req, res) => {
//     const userID = req.params.userID;
//     const user = await User.findOne({ _id: userID });
//     res.json(user.picture);
// });

router.post('/createConversation', verifyAccessToken, async (req, res) => {

    const { name, users } = req.body;

    try {

        const chatid = uuidv4();

        //GROUP QUERY
        const insertUserQuery = `
            INSERT INTO chats ( chatid, type, group_name, group_picture, participants_count, recentmessagedate)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING group_name, group_picture, participants_count, recentmessagedate
        `;
        const insertResults = await pool.query(
            insertUserQuery,
            [chatid, 'group', name, 'https://images-ext-1.discordapp.net/external/PNLH64xfgvwICQgUWi9Ugld5IIcTgs5fURgaeVjx0g4/https/pbs.twimg.com/media/F15M-yMXoAIcTFz.jpg?width=893&height=583', users.length]
        );

        for (const e of users) {
            const selectUserID = ` SELECT userid FROM users WHERE username = $1;`;
            const resultUserID = await pool.query(selectUserID, [e]);
            const insertUserChatQuery = `
                INSERT INTO userchatrelationship ( userid, chatid)
                VALUES ($1, $2)
            `;
            await pool.query(insertUserChatQuery, [resultUserID.rows[0].userid, chatid]);
        }

        const newConv = insertResults.rows[0];


        res.status(201).send({ chat_name: newConv.group_name, chat_picture: newConv.group_picture, chatid: chatid, participants_count: newConv.participants_count, recentmessagedate: newConv.recentmessagedate, type: "group" });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).send({ error: 'An error occurred while creating the conversation' });
    }
});

router.post('/api/addFriend/', verifyAccessToken, async (req, res) => {

    const sender = req.user.username;
    const receiver = req.body.username;

    try {

        const selectSenderID = ` SELECT userid FROM users WHERE username = $1;`;
        const resultSenderID = await pool.query(selectSenderID, [sender]);

        const selectReceiverID = ` SELECT userid FROM users WHERE username = $1;`;
        const resultReceiverID = await pool.query(selectReceiverID, [receiver]);

        const selectRelationshipQuery = `
            SELECT sender, receiver, status FROM useruserrelationship
            WHERE sender = $1 AND receiver = $2 OR sender = $2 AND receiver = $1
            LIMIT 1
        `;

        const result = await pool.query(selectRelationshipQuery, [resultSenderID.rows[0].userid, resultReceiverID.rows[0].userid]);

        if (result.rows.length > 0 && result.rows[0].status === 'accepted') {
            res.status(401).send({ message: 'Already friends with the user!' });
        } else if (result.rows.length > 0 && result.rows[0].status === 'pending') {
            res.status(401).send({ message: 'Friend Request already sent!' });
        } else {

            if (!(resultReceiverID.rows.length)) {
                res.status(401).send({ message: 'User not found' });
            } else {
                const insertRelationshipQuery = `
                    INSERT INTO useruserrelationship (sender, receiver, status)
                    VALUES ($1, $2, $3)
                    RETURNING id 
                `;

                await pool.query(insertRelationshipQuery, [resultSenderID.rows[0].userid, resultReceiverID.rows[0].userid, 'pending']);

                const sendingQuery = `
                    SELECT
                        uur.status,
                        json_build_object('userid', u.userid, 'username', u.username, 'picture', u.picture) AS sender,
                        json_build_object('userid', ur.userid, 'username', ur.username, 'picture', ur.picture) AS receiver
                    FROM useruserrelationship uur
                    JOIN users u ON uur.sender = u.userid
                    JOIN users ur ON uur.receiver = ur.userid
                    WHERE uur.sender = $1 AND uur.receiver = $2
                    LIMIT 1
                `;
                const sendingResult = await pool.query(sendingQuery, [resultSenderID.rows[0].userid, resultReceiverID.rows[0].userid]);

                res.status(200).send({ request: sendingResult.rows[0], message: 'Friend request sent successfully' });
            }
        }
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send({ error: 'An error occurred while adding the friend' });
    }
});

router.get('/api/user/friendlist', verifyAccessToken, async (req, res) => {
    const query = `
        SELECT
        uur.status,
        CASE
            WHEN u.userid = uur.sender THEN
            json_build_object('userid', u.userid, 'username', u.username)
            ELSE
            json_build_object('userid', us.userid, 'username', us.username, 'picture', us.picture)
        END AS sender,
        CASE
            WHEN u.userid = uur.receiver THEN
            json_build_object('userid', u.userid, 'username', u.username)
            ELSE
            json_build_object('userid', ur.userid, 'username', ur.username, 'picture', ur.picture)
        END AS receiver
        FROM users u
        JOIN useruserrelationship uur ON u.userid = uur.sender OR u.userid = uur.receiver
        LEFT JOIN users us ON uur.sender = us.userid
        LEFT JOIN users ur ON uur.receiver = ur.userid
        WHERE u.username = $1;
    `
    const result = await pool.query(query, [req.user.username]);
    const friendList = result.rows;

    res.json(friendList);
});

router.delete('/api/deleteRequest', verifyAccessToken, async (req, res) => {
    try {
        const receiver = req.body.receiver;
        const sender = req.body.sender;

        const query = ` DELETE FROM useruserrelationship WHERE receiver = $1 AND sender = $2; `
        await pool.query(query, [receiver, sender]);

        res.status(200).send({ message: 'Declining friend request successfully' });

    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).send({ error: 'An error occurred while declining friend request' });
    }
});

router.post('/api/acceptRequest', verifyAccessToken, async (req, res) => {
    try {

        const receiver = req.body.receiver;
        const sender = req.body.sender;

        const query = `UPDATE useruserrelationship SET status = 'accepted' WHERE receiver = $1 AND sender = $2;`;
        await pool.query(query, [receiver, sender]);

        const chatid = uuidv4();

        const insertUserQuery = `
            INSERT INTO chats ( chatid, type, participants_count, recentmessagedate)
            VALUES ($1, $2, $3, NOW())
            RETURNING recentmessagedate;
        `;

        const insertResults = await pool.query(
            insertUserQuery,
            [chatid, 'private', 2]
        );

        const insertUserChatQuery = `
            INSERT INTO userchatrelationship ( userid, chatid)
            VALUES ($1, $2)
        `;

        await pool.query(insertUserChatQuery, [receiver, chatid]);
        await pool.query(insertUserChatQuery, [sender, chatid]);

        const userInfoQuery = ` SELECT username, picture FROM users WHERE userid = $1;`;
        const resultSenderID = await pool.query(userInfoQuery, [sender]);
        const resultReceiverID = await pool.query(userInfoQuery, [receiver]);

        const forReceiver = {
            chatid: chatid,
            type: 'private',
            chat_name: resultSenderID.rows[0].username,
            chat_picture: resultSenderID.rows[0].picture,
            participants_count: 2,
            recentmessagedate: insertResults.rows[0].recentmessagedate,
        }

        const forSender = {
            chatid: chatid,
            type: 'private',
            chat_name: resultReceiverID.rows[0].username,
            chat_picture: resultReceiverID.rows[0].picture,
            participants_count: 2,
            recentmessagedate: insertResults.rows[0].recentmessagedate,
        }

        res.status(200).send({ forReceiver: forReceiver, forSender: forSender, message: 'Accepting friend request successfully' });

    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).send({ error: 'An error occurred while accepting friend request' });
    }
});

module.exports = router;