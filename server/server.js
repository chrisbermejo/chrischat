const express = require('express');
const http = require('http');
const cors = require('cors');

require('./database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const routes = require('./routes/index')
app.use('/', routes)

const server = http.createServer(app);
const WebSocket = require('./web/index');
WebSocket(server);


server.listen(4000, () => {
    console.log('Server is running on port 4000');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});