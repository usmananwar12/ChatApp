const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {}; 

app.use(express.static('public'));

app.get('/p2p-files', (req, res) => {
    fs.readdir(p2pFolder, (err, files) => {
        if (err) {
            console.error('Error reading files:', err);
            res.status(500).json({ error: 'Error reading files' });
        } else {
            res.json(files); // Return file list as JSON
        }
    });
});

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
        console.log(message);
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    const saveFile = (file) => {
        const filePath = path.join(p2pFolder, file.name);
        const base64Data = file.data.split(',')[1]; // Extract base64 data
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    };
    
    // Save group chat files
    socket.on('send-file', (file) => {
        saveFile(file); 
        socket.broadcast.emit('receive-file', {
            name: file.name,
            data: file.data,
            type: file.type,
            sender: users[socket.id],
        });
        io.emit('file-updated'); 
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
    saveFile(file); // Save file to p2p-files folder
    const recipientSocket = Object.keys(users).find(id => users[id] === file.to);
    if (recipientSocket) {
        io.to(recipientSocket).emit('dm-receive-file', {
            name: file.name,
            data: file.data,
            type: file.type,
            sender: users[socket.id],
        });
    }
    io.emit('file-updated'); 
    });
});

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Create "p2p-files" folder if it doesn't exist
const p2pFolder = path.join(__dirname, 'public/p2p-files');
if (!fs.existsSync(p2pFolder)) {
    fs.mkdirSync(p2pFolder);
}

// Serve files from the "p2p-files" folder
app.use('/p2p-files', express.static(p2pFolder));

// Configure file upload using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, p2pFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// API Endpoint to upload a file
app.post('/upload-file', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully', file: req.file.filename });
});


http.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});
