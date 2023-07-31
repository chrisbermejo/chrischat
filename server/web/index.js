require('dotenv').config()

const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const pool = require('../database/PostgreSQL');

const verifyToken = require('../verifyToken');

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

                const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET)

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

        socket.on('join', (room, user) => {
            socket.join(room);
            // console.log(`User: ${user} Joined Room: ${room}`)
            // console.log(socket.handshake.auth)
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
            newData.from = 'socket'

            console.log("emitted");
            channel.to(data.chatid).emit('receive_message', newData);
        });

        socket.on('disconnect', () => {
            console.log(`User Disconnected: ${socket.id}`);
        });
    });

    instrument(io, { auth: false, mode: 'development' });
};
