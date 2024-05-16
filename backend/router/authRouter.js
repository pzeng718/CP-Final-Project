// authRouter.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbHandler = require('../db/handler');

const router = express.Router();

const JWT_KEY = 'g70OvStrb6r0Sp9rUT3IEnrgqmJ20kAuw+wyRazHXUfs9ptNAwN85bnM3BAn67218xlg4tSynkDchx3n0JOV5g==';

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    dbHandler.executeQuery(`select * from todo.user where username = "${username}"`, (err, results) => {
        if (results.length > 0) {
            res.status(400).json({ message: 'Signup failed', error: 'User Already Exists' });
        } else {
            try {
                const token = jwt.sign({ username }, JWT_KEY, { expiresIn: '1h' });
                res.cookie('token', token, { sameSite: 'strict' });
                dbHandler.executeQuery(`insert into todo.user (UserName, PasswordHash) values ("${username}", "${hashedPassword}")`, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Signup failed', error: err });
                    }
                    res.cookie('userid', results.insertId, { sameSite: 'strict' });
                    res.status(201).json({ userId: results.insertId, message: 'User created' });
                });
            } catch (error) {
                res.status(400).json({ message: 'Signup failed', error });
            }
        }
    });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        dbHandler.executeQuery(`select * from todo.user where username = "${username}"`, async (err, results) => {
            if (err) {
                return res.status(500).send('Error logging in');
            }

            const user = results[0];
            if (!user) {
                return res.status(400).send('Invalid credentials');
            }

            const validPassword = await bcrypt.compare(password, user.PasswordHash);
            if (!validPassword) {
                return res.status(400).send('Invalid credentials');
            }

            const token = jwt.sign({ username }, JWT_KEY);
            res.cookie('token', token, { sameSite: 'strict' });
            res.cookie('userid', user.UserID, { sameSite: 'strict' });
            res.status(200).json({ token, userId: user.UserID });
        });
    } catch (error) {
        res.status(400).send('Error logging in');
    }
});

router.get('/validate', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Not authenticated');
    }
    try {
        jwt.verify(token, JWT_KEY);
        res.send('Authenticated');
    } catch (error) {
        res.status(401).send('Not authenticated');
    }
});

module.exports = router;
