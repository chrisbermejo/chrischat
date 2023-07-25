const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const Message = require('../database/schemas/message');
const Room = require('../database/schemas/room');

const verifyToken = require('../verifyToken');

const SERECT_WORD = '123456';

module.exports = function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://admin.socket.io'],
            credentials: true,
        },
    });

    const channel = io.of('/channel');

    channel.on('connection', (socket) => {

        const token = socket.handshake.headers.cookie?.split('=')[1];

        if (token) {
            try {

                const decoded = verifyToken(token, SERECT_WORD)

                console.log(`User ${decoded.username} connected. ID ${socket.id}`);

                socket.emit('authenticated', { message: 'Authenticated successfully' });

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

        socket.on('join', (room) => {
            socket.join(room);
            console.log(`User Joined Room: ${room}`)
            // console.log(socket.handshake.auth)
        });

        socket.on('leave', (room) => {
            socket.leave(room);
            console.log(`User Left Room: ${room}`);
        });

        socket.on('send_message', async (data) => {

            const messageObj = {
                room: data.room,
                id: socket.id,
                user: data.user,
                message: data.message,
                date: data.date,
                time: data.time
            };

            const newMessages = new Message(messageObj);
            await newMessages.save();

            const room = await Room.findOne({ id: data.room });
            room.mostRecentMessageDate = data.date;
            await room.save();

            channel.to(data.room).emit('receive_message', messageObj);
        });

        socket.on('disconnect', () => {
            console.log(`User Disconnected: ${socket.id}`);
        });
    });

    instrument(io, { auth: false, mode: 'development' });
};
