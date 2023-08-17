const express = require('express');
const router = express.Router();

const pool = require('../database/PostgreSQL');

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

let GROUP_PICTURE_INDEX = 0;
const GROUP_PICTURE_ARRAY = [
    'https://media.discordapp.net/attachments/1028895750819692616/1139306314288341052/blank-group-picture-gray.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306314019897354/blank-group-picture-red.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306314791669790/blank-group-picture-pink.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306315127193630/blank-group-picture-purple.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306315513090099/blank-group-picture-dark-blue.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306315869585428/blank-group-picture.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306316238704751/blank-group-picture-green-blue.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306316544868433/blank-group-picture-green.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306316913987746/blank-group-picture-yellow.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1139306317274677399/blank-group-picture-orange.png',
];

const verifyAccessToken = async (req, res, next) => {
    const accesstoken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accesstoken && !refreshToken) {
        req.user = { isLoggedIn: false, username: false, picture: false, email: false };
        return next();
    }
    try {
        if (accesstoken) { // Verify the access token and proceed with the request if valid
            const decoded = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET);
            const selectUserQuery = `
                SELECT username, picture, email, userid FROM users
                WHERE username = $1
                LIMIT 1
            `;

            const result = await pool.query(selectUserQuery, [decoded.username]);
            const user = result.rows[0];

            const selectUserUserRelationshipCountQuery = `
                SELECT COUNT(*) AS userUserRelationshipCount
                FROM useruserrelationship
                WHERE sender = $1 OR receiver = $1
            `;

            const selectUserChatRelationshipCountQuery = `
                SELECT COUNT(*) AS userChatRelationshipCount
                FROM userchatrelationship
                WHERE userid = $1
            `;

            const userUserRelationshipResult = await pool.query(selectUserUserRelationshipCountQuery, [user.userid]);
            const userChatRelationshipResult = await pool.query(selectUserChatRelationshipCountQuery, [user.userid]);

            const userUserRelationshipCount = userUserRelationshipResult.rows[0].useruserrelationshipcount;
            const userChatRelationshipCount = userChatRelationshipResult.rows[0].userchatrelationshipcount;

            req.user = {
                isLoggedIn: true,
                username: user.username,
                picture: user.picture,
                email: user.email,
                FriendListCount: userUserRelationshipCount,
                ConversationCount: userChatRelationshipCount
            };

            return next();
        } else {
            // If the access token is not present, attempt to refresh it using the refresh token
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // Check if the refresh token corresponds to a valid user
            const selectUserQuery = `
                SELECT username, picture, email FROM users
                WHERE userid = $1
                LIMIT 1
            `;
            const result = await pool.query(selectUserQuery, [decodedRefreshToken.userid]);
            const user = result.rows[0];

            const selectUserUserRelationshipCountQuery = `
                SELECT COUNT(*) AS userUserRelationshipCount
                FROM useruserrelationship
                WHERE sender = $1 OR receiver = $1
            `;

            const selectUserChatRelationshipCountQuery = `
                SELECT COUNT(*) AS userChatRelationshipCount
                FROM userchatrelationship
                WHERE userid = $1
            `;

            const userUserRelationshipResult = await pool.query(selectUserUserRelationshipCountQuery, [decodedRefreshToken.userid]);
            const userChatRelationshipResult = await pool.query(selectUserChatRelationshipCountQuery, [decodedRefreshToken.userid]);
            const userUserRelationshipCount = userUserRelationshipResult.rows[0].useruserrelationshipcount;
            const userChatRelationshipCount = userChatRelationshipResult.rows[0].userchatrelationshipcount;

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
            req.user = {
                isLoggedIn: true,
                username: user.username,
                picture: user.picture,
                email: user.email,
                FriendListCount: userUserRelationshipCount,
                ConversationCount: userChatRelationshipCount
            };
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
        SELECT
            chatid,
            type,
            chat_name,
            chat_picture,
            online,
            participants_count,
            recentmessagedate,
            ARRAY_AGG(DISTINCT username) AS participants
        FROM (
            SELECT
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
                CASE
                    WHEN c.type = 'group' THEN NULL
                    WHEN c.type = 'private' THEN
                        CASE
                            WHEN u.username = $1 THEN u2.online
                            ELSE u.online
                        END
                    ELSE NULL
                END AS online,
                c.participants_count,
                c.recentmessagedate,
                up.username
            FROM chats AS c
            JOIN userchatrelationship AS ucr ON c.chatid = ucr.chatid
            JOIN users AS u ON ucr.userid = u.userid
            LEFT JOIN userchatrelationship AS ucr2 ON c.chatid = ucr2.chatid AND ucr.userid != ucr2.userid
            LEFT JOIN users AS u2 ON ucr2.userid = u2.userid
            LEFT JOIN userchatrelationship AS ucr_participants ON c.chatid = ucr_participants.chatid
            LEFT JOIN users AS up ON ucr_participants.userid = up.userid
            WHERE u.username = $1
        ) AS subquery
        GROUP BY chatid, type, chat_name, chat_picture, online, participants_count, recentmessagedate;
    `;
    const result = await pool.query(selectChatQuery, [req.user.username]);
    const conversations = result.rows;
    res.json(conversations);
});

router.get('/api/user/:username/profilePicture', verifyAccessToken, async (req, res) => {
    const userID = req.params.username;
    const selectPictureQuery = `
            SELECT picture FROM users
            WHERE username = $1
        `;
    const result = await pool.query(selectPictureQuery, [userID]);
    userPicture = result.rows[0].picture;
    res.json(userPicture);
});

router.post('/createConversation', verifyAccessToken, async (req, res) => {

    const { name, users } = req.body;

    if (GROUP_PICTURE_INDEX >= 10) {
        GROUP_PICTURE_INDEX = 0;
    }

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
            [chatid, 'group', name, GROUP_PICTURE_ARRAY[GROUP_PICTURE_INDEX], users.length]
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

        GROUP_PICTURE_INDEX++;
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

        if (!(resultReceiverID.rows.length) || !(resultSenderID.rows.length)) {
            res.status(401).send({ message: 'User not found' });
        }

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
        } else if (result.rows.length > 0 && result.rows[0].status === 'unfriended') {
            const query = `UPDATE useruserrelationship SET status = 'pending' WHERE receiver = $1 AND sender = $2;`;
            const updateResults = await pool.query(query, [resultReceiverID.rows[0].userid, resultSenderID.rows[0].userid]);
            if (updateResults.rowCount >= 0) {
                const query = `UPDATE useruserrelationship SET sender = $2, receiver = $1, status = 'pending' WHERE receiver = $2 AND sender = $1;`;
                await pool.query(query, [resultReceiverID.rows[0].userid, resultSenderID.rows[0].userid]);
            }
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
            json_build_object('userid', us.userid, 'username', us.username, 'picture', us.picture, 'online', us.online)
        END AS sender,
        CASE
            WHEN u.userid = uur.receiver THEN
            json_build_object('userid', u.userid, 'username', u.username)
            ELSE
            json_build_object('userid', ur.userid, 'username', ur.username, 'picture', ur.picture, 'online', ur.online)
        END AS receiver
        FROM users u
        JOIN useruserrelationship uur ON u.userid = uur.sender OR u.userid = uur.receiver
        LEFT JOIN users us ON uur.sender = us.userid
        LEFT JOIN users ur ON uur.receiver = ur.userid
        WHERE u.username = $1 AND uur.status <> $2;
    `
    const result = await pool.query(query, [req.user.username, 'unfriended']);
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

        const findExistingChatQuery = `
            SELECT EXISTS (
            SELECT 1
            FROM userchatrelationship AS ucr1
            JOIN userchatrelationship AS ucr2 ON ucr1.chatid = ucr2.chatid
            JOIN chats ON ucr1.chatid = chats.chatid
            WHERE ucr1.userid = $1
            AND ucr2.userid = $2
            AND chats.type = $3
            );
        `
        const findExistingChatResult = await pool.query(findExistingChatQuery, [receiver, sender, 'private']);

        if (!findExistingChatResult.rows[0].exists) {
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

            const userInfoQuery = ` SELECT username, picture, online FROM users WHERE userid = $1;`;
            const resultSenderID = await pool.query(userInfoQuery, [sender]);
            const resultReceiverID = await pool.query(userInfoQuery, [receiver]);

            const forReceiver = {
                chatid: chatid,
                type: 'private',
                chat_name: resultSenderID.rows[0].username,
                chat_picture: resultSenderID.rows[0].picture,
                participants_count: 2,
                recentmessagedate: insertResults.rows[0].recentmessagedate,
                online: resultSenderID.rows[0].online,
            }

            const forSender = {
                chatid: chatid,
                type: 'private',
                chat_name: resultReceiverID.rows[0].username,
                chat_picture: resultReceiverID.rows[0].picture,
                participants_count: 2,
                recentmessagedate: insertResults.rows[0].recentmessagedate,
                online: resultReceiverID.rows[0].online,
            }
            res.status(200).send({
                newChat: true,
                forReceiver: forReceiver,
                forSender: forSender,
                message: 'Accepting friend request successfully',
                senderOnline: resultSenderID.rows[0].online,
                receiverOnline: resultReceiverID.rows[0].online
            });
        } else {
            const userOnlineStatus = `SELECT online FROM users WHERE userid = $1;`
            const receiverOnlineStatus = await pool.query(userOnlineStatus, [receiver]);
            const senderOnlineStatus = await pool.query(userOnlineStatus, [sender]);
            res.status(200).send({
                newChat: false,
                forReceiver: false,
                forSender: false,
                message: 'Accepting friend request successfully',
                senderOnline: senderOnlineStatus.rows[0].online,
                receiverOnline: receiverOnlineStatus.rows[0].online
            });
        }
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).send({ error: 'An error occurred while accepting friend request' });
    }
});

router.post('/api/removeFriend', verifyAccessToken, async (req, res) => {
    try {

        const receiver = req.body.receiver.userid;
        const sender = req.body.sender.userid;
        const query = `UPDATE useruserrelationship SET status = 'unfriended' WHERE receiver = $1 AND sender = $2;`;
        await pool.query(query, [receiver, sender]);

        res.status(200).send({ message: 'Removing friend successfully' });

    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).send({ error: 'An error occurred while removing friend' });
    }
});

module.exports = router;