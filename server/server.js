const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://admin.socket.io'],
        credentials: true,
    },
});

let messageId = 1;
const messages = [];
const connectedUsers = new Set();

io.on('connection', (socket) => {
    connectedUsers.add(socket.id);
    console.log(`User Connected: ${socket.id}`);

    socket.on('send_message', (data) => {
        const message = {
            id: messageId++,
            message: data.message,
        };
        messages.push(message);
        socket.broadcast.emit('receive_message', message);
        console.log(messages);
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