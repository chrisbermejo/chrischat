const express = require('express');
const router = express.Router();

const Message = require('../database/schemas/message');

router.get('/1', async (req, res) => {
    const messages = await Message.find();
    res.json(messages);
});

module.exports = router;