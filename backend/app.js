const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dbHandler = require('./db/handler');
const app = express();

const predictUrl = 'http://54.172.238.63:4000/predict2';

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});