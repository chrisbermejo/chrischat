const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const Message = require('../database/schemas/message');
const Room = require('../database/schemas/room');
const jwt = require('jsonwebtoken');

module.exports = function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://admin.socket.io'],
            credentials: true,
        },
    });

    const channel = io.of('/channel');

    // channel.use(async (socket, next) => {
    //     try {
    //         const token = socket.handshake.headers.cookie?.replace('token=', '');
    //         console.log(`token : ${token}`)
    //         if (!token) {
    //             throw new Error('Token not provided');
    //         }

    //         // Verify the token
    //         const decoded = jwt.verify(token, '123456');
    //         console.log(`decoded : ${decoded}`);
    //         socket.user = decoded;

    //         // Proceed to the next middleware or event handler
    //         next();
    //     } catch (err) {
    //         // If the token is invalid, close the WebSocket connection
    //         socket.emit('error', { message: 'Invalid token' });
    //         socket.disconnect();
    //     }
    // });

    channel.on('connection', (socket) => {

        console.log(`User Connected: ${socket.id}`);

        socket.on('join', (room) => {
            socket.join(room);
            console.log(`User Joined Room: ${room}`)
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
