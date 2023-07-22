const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const Message = require('../database/schemas/message');
const Room = require('../database/schemas/room');

module.exports = function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://admin.socket.io'],
            credentials: true,
        },
    });

    const channel = io.of('/channel');

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
