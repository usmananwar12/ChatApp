
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",  
        methods: ["GET", "POST"]  
    }
});

app.use(express.static('public')); 

const user = {};


io.on('connection', (socket) => {
    socket.on('new-user-joined', (name) => {
        console.log("New User joined : ", name);
        user[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', (message) => {
        socket.broadcast.emit('recieve', { message: message, name: user[socket.id] });
    });

    socket.on('send-file', (file) => {
        socket.broadcast.emit('receive-file', {
            name: file.name,
            data: file.data,
            type: file.type,
            sender: user[socket.id],
        });
    });

    socket.on('disconnect1', () => {
        socket.broadcast.emit('left', user[socket.id]);
        delete user[socket.id];
    });
});


http.listen(8000, () => {
    console.log('Server running on http://192.168.18.17:6000');
});
