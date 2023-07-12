const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const PORT = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
    origin: '*',
    Credential: true,
    optionSuccesStatus: 200
};

app.use(cors(corsOptions));

app.get('/api', (req, res) => {
    res.json({ 'users': ['1'] })
})

app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`)
});