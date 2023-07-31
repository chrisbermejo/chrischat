const express = require('express');
const router = express.Router();

const pool = require('../database/PostgreSQL');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const uuidID = uuidv4();

    try {
        const insertUserQuery = `
            INSERT INTO users ( userid, username, picture, email, password, createdAt)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, userid, username, picture
        `;

        const values = [uuidID, username, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', email, password];

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
        res.status(201).send({ message: 'User created successfully', username: user.username, picture: user.picture });
    } catch (error) {
        res.status(400).send({ error, message: 'User not created' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

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
});

router.post('/logout', async (req, res) => {
    // Clear both access token and refresh token cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).send({ message: 'Logout successful' });
});

module.exports = router;