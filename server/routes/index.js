const express = require('express');
const router = express.Router();

const pool = require('../database/PostgreSQL');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const jwt = require('jsonwebtoken');

let PROFILE_PICTURE_INDEX = 0;
const PROFILE_PICTURE_ARRAY = [
    'https://media.discordapp.net/attachments/1028895750819692616/1138579202510164028/blank-profile-picture.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581408474996826/blank-profile-picture-pink.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581411708809326/blank-profile-picture-purple.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581412023378022/blank-profile-picture-dark-blue.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581412283429034/blank-profile-picture-green-blue.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581412283429034/blank-profile-picture-green-blue.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581412530888876/blank-profile-picture-green.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581412753195068/blank-profile-picture-yellow.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581413034209380/blank-profile-picture-orange.png',
    'https://media.discordapp.net/attachments/1028895750819692616/1138581413373943818/blank-profile-picture-red.png'
];

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const uuidID = uuidv4();

    if (PROFILE_PICTURE_INDEX >= 10) {
        PROFILE_PICTURE_INDEX = 0;
    }

    try {
        const insertUserQuery = `
            INSERT INTO users ( userid, username, picture, email, password, createdAt)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, userid, username, picture
        `;

        const values = [uuidID, username, PROFILE_PICTURE_ARRAY[PROFILE_PICTURE_INDEX], email, password];

        const result = await pool.query(insertUserQuery, values);
        const user = result.rows[0];

        const accessToken = jwt.sign({ isLoggedIn: true, username: user.username, picture: user.picture }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userid: user.userid }, process.env.REFRESH_TOKEN_SECRET);

        // Set the refresh token as an HttpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days (example duration)
        });
        // Set the access token as an HttpOnly cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 1000 * 15 // 15 minutes (example duration)
        });
        PROFILE_PICTURE_INDEX++;
        res.status(201).send({ message: 'User created successfully', username: user.username, picture: user.picture });
    } catch (error) {
        res.status(400).send({ error, message: 'User not created' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const selectUserQuery = `
        SELECT userid, username, picture FROM users
        WHERE username = $1 AND password = $2
        LIMIT 1
    `;
        const result = await pool.query(selectUserQuery, [username, password]);
        const user = result.rows[0];

        const accessToken = jwt.sign({ isLoggedIn: true, username: user.username, picture: user.picture }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userid: user.userid }, process.env.REFRESH_TOKEN_SECRET);

        // Set the refresh token as an HttpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days (example duration)
        });

        // Set the access token as an HttpOnly cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 1000 * 15 // 15 minutes (example duration)
        });

        return res.status(200).send({ message: 'Login successful', username: user.username, picture: user.picture });
    } catch (error) {
        res.status(400).send({ error, message: 'Unable to login' });
    }
});

router.post('/logout', async (req, res) => {
    // Clear both access token and refresh token cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).send({ message: 'Logout successful' });
});

module.exports = router;