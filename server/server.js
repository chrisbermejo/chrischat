const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('./database');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET, POST, OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const routes = require('./routes/index');
app.use('/', routes);

const room = require('./routes/room');
app.use('/', room);

const server = http.createServer(app);
const WebSocket = require('./web/index');
WebSocket(server);

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});