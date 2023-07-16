const express = require('express');
const router = express.Router();

const User = require('../database/schemas/user');

router.post('/register', async (req, res) => {

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

module.exports = router