const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dbHandler = require('./db/handler');
const app = express();

const predictUrl = 'http://54.172.238.63:4000/predict2';

const PORT = process.env.PORT || 3000;
const users = {};
const JWT_KEY = 'g70OvStrb6r0Sp9vUT3IEnrgqmJ20kAuw+wyRazHXUfs9ptNAwN85bnM3BAn67218xlg4tSynkDchx3n0JOV5g==';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://cppart2-web-1295080897.us-east-2.elb.amazonaws.com',
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('Hello, welcome to our server!');
});

app.post('/predict', (req, res) => {
    console.log(req.body);

    axios.post(predictUrl, req.body, { 'Content-Type': 'application/json' })
    .then(response => {
        res.status(200).send(response.data);
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });
});

app.post('/db', (req, res) => {
    const query = req.body.query;
    dbHandler.executeQuery(query, (err, results) => {
        if (err) {
            res.status(500).send('Query error: ' + err);
            return;
        }
        res.json(results);
    });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { username, password: hashedPassword };

    const token = jwt.sign({ username }, JWT_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.status(201).json({ message: 'User created' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, JWT_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.json({ message: 'Login successful' });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

app.get('/validate', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});