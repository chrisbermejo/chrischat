const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const Message = require('../database/schemas/message');

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

        // channel.emit('established');

        socket.on('send_message', async (data) => {
            const messageObj = {
                user: socket.id,
                message: data.message,
            };

            const newMessages = new Message({
                message: data.message,
                user: socket.id,
            });

            await newMessages.save();

            channel.emit('receive_message', messageObj);
        });

        socket.on('disconnect', () => {
            console.log(`User Disconnected: ${socket.id}`);
        });
    });

    instrument(io, { auth: false, mode: 'development' });
};