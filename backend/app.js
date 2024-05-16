const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const dbHandler = require('./db/handler');
const authRouter = require('./router/authRouter'); // Import the authRouter
const todoRouter = require('./router/todoRouter');

const http = require('http');
const app = express();
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://cppart2-web-1295080897.us-east-2.elb.amazonaws.com:80", // Adjust this to match your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
    });

    socket.on('updateTodo', async (data) => {
        const { roomId, todo } = data;

        console.log('updating for all users');
        socket.to(roomId).emit('receiveTodoUpdate', todo);
    });

    socket.on('shareTodo', async (data) => {
        const { roomId, todo } = data;

        console.log('sharing todo for all users');
        socket.to(roomId).emit('receiveTodoShare', todo);
    });

    socket.on('deleteTodo', async (data) => {
        const { roomId, todo } = data;

        console.log('deleting for all users');
        socket.to(roomId).emit('receiveTodoDelete', todo);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const predictUrl = 'http://54.172.238.63:4000/predict2';

const PORT = process.env.PORT || 3000;
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

app.use('/auth', authRouter);
app.use('/todo', todoRouter);

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
    console.log(query);
    dbHandler.executeQuery(query, (err, results) => {
        if (err) {
            res.status(500).send('Query error: ' + err);
            return;
        }
        res.json(results);
    });
});

app.post('/shareTodo', (req, res) => {
    const { todoId, userId, fromUserId } = req.body;
    const roomId = `room-${todoId}`; // Generate a room ID based on the todo ID

    dbHandler.executeQuery(`select * from todo.user where UserID = ${userId}`, (err, results) => {
        if(results.length === 0){
            res.status(400).send({msg: 'User does not exist.'})
        }else{
            dbHandler.executeQuery(`INSERT INTO shared_todos (todo_id, room_id, user_id, from_user_id) VALUES (${todoId}, "${roomId}", ${userId}, ${fromUserId})`, (err, results) => {
                if (err) {
                    res.status(500).json({ message: 'Sharing failed', error: err });
                } else {
                    io.to(userId).emit('joinRoom', roomId);
                    res.status(200).json({ message: 'Todo shared successfully', roomId });
                }
            });
        }
    })
    
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});