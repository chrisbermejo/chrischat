const express = require('express');
const router = express.Router();

require('dotenv').config()

const User = require('../database/schemas/user');

const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {

    const { username, email, password } = req.body;

    try {
        const user = new User({
            username: username,
            email: email,
            password: password
        });
        await user.save();

        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).send({ error, message: 'User not created' });
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    } else {
        console.log(process.env.SECRET_WORD)
        const token = jwt.sign({ isLoggedIn: true, username: user.username, picture: user.picture }, process.env.SECRET_WORD, { expiresIn: '15m' });
        res.cookie('token', token, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 1000 * 15
        });
        return res.status(200).send({ message: 'Login successful', username: user.username, picture: user.picture });
    }
});

router.post('/logout', async (req, res) => {
    res.clearCookie('token', { path: '/' });
    return res.status(200).send({ message: 'Logout successful' });
});

module.exports = router;
