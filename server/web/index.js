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

    let messageId = 1;
    const connectedUsers = new Set();

    io.of('/channel').on('connection', (socket) => {
        connectedUsers.add(socket.id);
        console.log(`User Connected: ${socket.id}`);

        socket.on('send_message', async (data) => {
            const messageObj = {
                user: socket.id,
                id: messageId++,
                message: data.message,
            };

            const newMessages = new Message({
                message: data.message,
                user: socket.id,
            });

            await newMessages.save();

            io.of('/channel').emit('receive_message', messageObj);
        });

        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            console.log(`User Disconnected: ${socket.id}`);
        });
    });

    instrument(io, { auth: false, mode: 'development' });
};
