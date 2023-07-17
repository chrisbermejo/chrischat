const express = require('express');
const router = express.Router();

const User = require('../database/schemas/user');

const jwt = require('jsonwebtoken');
const JWT_SERECT = '123456';

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
        res.status(400).send({ error, message: 'User not created' });
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ user: req.body.email, password: req.body.password });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    } else {
        const token = jwt.sign({ user: req.body.email }, JWT_SERECT, { expiresIn: '1m' });
        return res.status(200).send({ token });
    }
});

module.exports = router