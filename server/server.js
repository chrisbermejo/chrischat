const express = require('express');
const http = require('http');
const cors = require('cors');

const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

require('./database');

const Message = require('./database/schemas/message');
const User = require('./database/schemas/user');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/register', async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = new User({
            user: email,
            password: password
        });
        await user.save();
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).send({ error });
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

const server = http.createServer(app);
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
            user: socket.id
        });

        await newMessages.save();

        io.of('/channel').emit('receive_message', messageObj);
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