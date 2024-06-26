require('dotenv').config()

const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const pool = require('../database/PostgreSQL');
const jwt = require('jsonwebtoken');

function getAccessTokenFromCookies(cookies) {
    if (!cookies) {
        return null;
    }

    const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));

    if (!tokenCookie) {
        return null;
    }

    return tokenCookie.split('=')[1];
}

module.exports = function setupWebSocket(server) {

    const onlineUsers = {}

    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://admin.socket.io'],
            credentials: true,
        },
    });

    const channel = io.of('/channel');

    channel.on('connection', (socket) => {

        const cookies = socket.handshake.headers.cookie?.split('; ');

        const accessToken = getAccessTokenFromCookies(cookies);

        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                console.log(`User ${decoded.username} connected. ID ${socket.id}`);
            } catch (error) {
                console.log('Token validation error:', error.message);
                socket.emit('unauthorized', { error: 'Invalid or expired token' });
                socket.disconnect(true);
                return;
            }
        } else {
            console.log('Token not provided');
            socket.emit('unauthorized', { error: 'Token not provided' });
            socket.disconnect(true);
            return;
        }

        socket.on('logged', async (username) => {
            if (onlineUsers[username]) {
                onlineUsers[username].push(socket.id);
            } else {
                onlineUsers[username] = [socket.id];
                const updateUserOnlineQuery = `UPDATE users SET online = true WHERE username = $1 RETURNING userid`;
                const updateOnlineResult = await pool.query(updateUserOnlineQuery, [username]);
                channel.emit('updateFriendList', { username: username, userid: updateOnlineResult.rows[0].userid }, true);
            }
            console.log(onlineUsers);
        });

        socket.on('sendFriendRequest', (users, data) => {
            for (let j = 0; j < users.length; j++) {
                const receiverSocketIds = onlineUsers[users[j]];
                if (receiverSocketIds) {
                    for (let i = 0; i < receiverSocketIds.length; i++) {
                        const socketId = receiverSocketIds[i];
                        channel.to(socketId).emit('receiveFriendRequest', data);
                    }
                }
            }
        });

        socket.on('sendDelcineRequest', (users, data) => {
            for (let j = 0; j < users.length; j++) {
                const receiverSocketIds = onlineUsers[users[j]];
                if (receiverSocketIds) {
                    for (let i = 0; i < receiverSocketIds.length; i++) {
                        const socketId = receiverSocketIds[i];
                        channel.to(socketId).emit('receiveDelcineRequest', data);
                    }
                }
            }
        });

        socket.on('sendAcceptRequest', (type, users, data, requests, onlineStatus) => {
            for (let j = 0; j < users.length; j++) {
                const receiverSocketIds = onlineUsers[users[j]];
                if (receiverSocketIds) {
                    for (let i = 0; i < receiverSocketIds.length; i++) {
                        const socketId = receiverSocketIds[i];
                        channel.to(socketId).emit('receiveAcceptRequest', type, data, requests[j], onlineStatus[j]);
                    }
                }
            }
        });

        socket.on('sendConversation', (users, data) => {
            for (let j = 0; j < users.length; j++) {
                const receiverSocketIds = onlineUsers[users[j]];
                if (receiverSocketIds) {
                    for (let i = 0; i < receiverSocketIds.length; i++) {
                        const socketId = receiverSocketIds[i];
                        channel.to(socketId).emit('receiveConversation', data);
                    }
                }
            }
        });

        socket.on('sendRemoveFriend', (users, data) => {
            for (let j = 0; j < users.length; j++) {
                const receiverSocketIds = onlineUsers[users[j]];
                if (receiverSocketIds) {
                    for (let i = 0; i < receiverSocketIds.length; i++) {
                        const socketId = receiverSocketIds[i];
                        channel.to(socketId).emit('receiveRemoveFriend', data);
                    }
                }
            }
        });

        socket.on('join', (room) => {
            socket.join(room);
        });

        socket.on('leave', (room) => {
            socket.leave(room);
            console.log(`User Left Room: ${room}`);
        });

        socket.on('send_message', async (data) => {

            const newData = data;

            const insertMessageQuery = `
                INSERT INTO messages (chatid, username, message, time, date)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING date, time
            `;
            const results = await pool.query(
                insertMessageQuery,
                [data.chatid, data.username, data.message, data.time]
            );

            newData.date = results.rows[0].date;

            channel.to(data.chatid).emit('receive_message', newData);

            const updateRecentMessagesQuery = `
                UPDATE chats
                SET recentmessagedate = $1
                WHERE chatid = $2;
            `

            await pool.query(
                updateRecentMessagesQuery,
                [results.rows[0].date, data.chatid,]
            );

        });

        socket.on('disconnect', async () => {
            for (const username in onlineUsers) {
                const index = onlineUsers[username].indexOf(socket.id);
                if (index !== -1) {
                    onlineUsers[username].splice(index, 1);
                    if (onlineUsers[username].length === 0) {
                        const updateUserOnlineQuery = `UPDATE users SET online = false WHERE username = $1 RETURNING userid`;
                        const updateOnlineResult = await pool.query(updateUserOnlineQuery, [username]);
                        channel.emit('updateFriendList', { username: username, userid: updateOnlineResult.rows[0].userid }, false);
                        delete onlineUsers[username];
                    }
                    break;
                }
            }
            console.log(`User Disconnected: ${socket.id}`);
            // io.emit('userList', Object.keys(onlineUsers));
            console.log(onlineUsers);
        });
    });

    instrument(io, { auth: false, mode: 'development' });
};
