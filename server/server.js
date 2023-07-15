const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

require('./database');

const messages = require('./database/schemas/message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://admin.socket.io'],
        credentials: true,
    },
});

let messageId = 1;
const connectedUsers = new Set();

io.on('connection', (socket) => {

    connectedUsers.add(socket.id);
    console.log(`User Connected: ${socket.id}`);

    socket.on('send_message', async (data) => {
        const messageObj = {
            user: socket.id,
            id: messageId++,
            message: data.message,
        };

        const newMessages = new messages({
            message: data.message,
            user: socket.id
        });

        await newMessages.save();

        io.emit('receive_message', messageObj);
    });

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        console.log(`User Disconnected: ${socket.id}`);
    });
});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
})

instrument(io, { auth: false, mode: 'development' });