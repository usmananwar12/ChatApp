const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {}; // Object to track connected users

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    socket.on('new-user-joined', (name) => {
        console.log("New User joined: ", name);
        users[socket.id] = name; // Store user by socket ID
        socket.broadcast.emit('user-joined', name); // Notify others
        io.emit('update-participants', Object.values(users)); // Send updated list to all
    });

    socket.on('send', (message) => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    socket.on('send-file', (file) => {
        socket.broadcast.emit('receive-file', {
            name: file.name,
            data: file.data,
            type: file.type,
            sender: users[socket.id],
        });
    });

    socket.on('disconnect', () => {
        const name = users[socket.id];
        if (name) {
            delete users[socket.id]; // Remove user
            socket.broadcast.emit('left', name); // Notify others
            io.emit('update-participants', Object.values(users)); // Send updated list to all
        }
    });

    socket.on('dm-message', ({ to, message }) => {
        const recipientSocket = Object.keys(users).find(id => users[id] === to);
        if (recipientSocket) {
            io.to(recipientSocket).emit('dm-message', { from: users[socket.id], message });
        }
    });
    
    socket.on('dm-send-file', (file) => {
        socket.broadcast.emit('dm-receive-file', {
            name: file.name,
            data: file.data,
            type: file.type,
            sender: users[socket.id],
        });
    });
});

http.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});
