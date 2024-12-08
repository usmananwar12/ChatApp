const socket = io('http://localhost:8000');

const form = document.getElementById('message-input');
const messageInput = document.getElementById('message');
const messageContainer = document.querySelector(".chat-box");
var msg = new Audio('alert.mp3');
var join_left = new Audio('Leave.mp3');


const append = (message, position, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(position); 

    if (sender) {
        const senderName = document.createElement('div');
        senderName.classList.add('sender-name');
        senderName.innerText = sender;
        messageElement.append(senderName); 
    }

    const messageText = document.createElement('p');
    messageText.innerText = message;
    messageElement.append(messageText);

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // This will show the time as HH:MM AM/PM
    messageElement.append(timestamp);

    messageContainer.append(messageElement);

    messageContainer.scrollTop = messageContainer.scrollHeight;
    if(position == 'user-joined'){        
        join_left.play();
    }
    else if(position == 'incoming'){        
        msg.play();
    }
};

const key = 'chatKey';

function encrypt(text) {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted); 
}

function decrypt(encodedText) {
    const text = atob(encodedText);
    let decrypted = '';
    for (let i = 0; i < text.length; i++) {
        decrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
}


form.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const message = messageInput.value.trim(); 

    if (message) {
        const encryptedMessage = encrypt(message); 
        append(message, 'outgoing', 'You'); 
        socket.emit('send', encryptedMessage);
        messageInput.value = ''; 
    }
});

const name = localStorage.getItem('username');
if (!name) {
    window.location.href = '/login.html'; 
} else {
    socket.emit('new-user-joined', name);
}


socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'user-joined');
});

socket.on('receive', (data) => {
    const decryptedMessage = decrypt(data.message); 
    append(decryptedMessage, 'incoming', data.name); 
});


socket.on('left', name => {
    append(`${name} left the chat`, 'user-joined');
})

const fileInput = document.getElementById('file-input');
const attachmentBtn = document.getElementById('attachment-btn');

attachmentBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            socket.emit('send-file', { name: file.name, data: reader.result, type: file.type });
            append(`You sent a file: ${file.name}`, 'outgoing', 'You');
        };
        reader.readAsDataURL(file); 
    }
});


socket.on('receive-file', (file) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'incoming');

    const senderName = document.createElement('div');
    senderName.classList.add('sender-name');
    senderName.innerText = file.sender;
    messageElement.append(senderName);

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = file.data; 
        img.alt = file.name;
        img.style.maxWidth = '100%'; 
        messageElement.append(img);

        const downloadLink = document.createElement('a');
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        downloadLink.innerText = 'Download Image';
        messageElement.append(downloadLink);
    } else if (file.type === 'text/plain') {
        const textPreview = document.createElement('p');
        const decodedText = atob(file.data.split(',')[1]); 
        
        textPreview.innerText = decodedText.length > 100
            ? decodedText.substring(0, 100) + '...'
            : decodedText;
        textPreview.style.whiteSpace = 'pre-wrap'; 
        messageElement.append(textPreview);

        const downloadLink = document.createElement('a');
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        downloadLink.innerText = 'Download Text File';
        messageElement.append(downloadLink);
    } else {
        const downloadLink = document.createElement('a');
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        downloadLink.innerText = `Download ${file.name}`;
        messageElement.append(downloadLink);
    }

    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

//just for the enter button
form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const message = messageInput.value.trim();
    if (message) {
        append(message, 'outgoing', 'You');
        socket.emit('send', message);
        messageInput.value = '';
    }
});

// Prevent Enter from triggering file input when message is focused
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        form.dispatchEvent(new Event('submit')); 
    }
});

//for logout botton
const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {

    localStorage.removeItem('username');
    socket.emit('disconnect1');
    
    
    window.location.href = '/login.html'; 
    
});


let currentChatUser = null; // Track the current user in DM

const participantsList = document.getElementById('participants-list');
const dmChatbox = document.getElementById('dm-chatbox');
const dmUsername = document.getElementById('dm-username');
const dmChatMessages = document.getElementById('dm-chat-messages');
const dmMessageInput = document.getElementById('dm-message');
const dmSendBtn = document.getElementById('dm-send-btn');

// Update participants when the server sends the list
socket.on('update-participants', (participants) => {
    participantsList.innerHTML = ''; // Clear the list
    participants.forEach((participant) => {
        const participantButton = document.createElement('button');
        participantButton.className = 'participant-btn';
        participantButton.innerText = participant;
        participantButton.addEventListener('click', () => {
            openDM(participant);
        });
        participantsList.appendChild(participantButton);
    });
});

// Open DM chatbox
function openDM(participant) {
    currentChatUser = participant; // Set current user
    dmUsername.innerText = `Chat with ${participant}`; // Update header
    dmChatbox.classList.remove('hidden'); // Show chatbox
    dmChatMessages.innerHTML = ''; // Clear chat messages for this user
}

// Handle DM message send
dmSendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const message = dmMessageInput.value.trim();
    if (message) {
        appendDM(message, 'outgoing');
        socket.emit('dm-message', { to: currentChatUser, message });
        dmMessageInput.value = ''; // Clear input
    }
});

// Append DM message
function appendDM(message, position, sender = 'You') {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', position);

    const messageText = document.createElement('p');
    messageText.innerText = message;
    messageElement.appendChild(messageText);

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageElement.appendChild(timestamp);

    dmChatMessages.appendChild(messageElement);
    dmChatMessages.scrollTop = dmChatMessages.scrollHeight;
}

// Receive DM messages
socket.on('dm-message', ({ from, message }) => {
    if (from === currentChatUser) {
        appendDM(message, 'incoming', from);
    } else {
        alert(`New DM from ${from}`); // Notify for new message
    }
});

const DMfileInput = document.getElementById('dm-file-input');
const DMattachmentBtn = document.getElementById('dm-attachment-btn');

// Trigger file input when attachment button is clicked
DMattachmentBtn.addEventListener('click', () => DMfileInput.click());

// Handle DM file upload
DMfileInput.addEventListener('change', () => {
    if (!currentChatUser) {
        alert('Please select a user to chat with.');
        return;
    }

    const file = DMfileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            // Emit the file to the server with recipient details
            socket.emit('dm-send-file', {
                to: currentChatUser,
                name: file.name,
                data: reader.result,
                type: file.type,
            });
            appendDM(`You sent a file: ${file.name}`, 'outgoing');
        };
        reader.readAsDataURL(file); // Read file as base64
    }
});

// Handle received DM file
socket.on('dm-receive-file', (file) => {
    if (file.sender === currentChatUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'incoming');

        const senderName = document.createElement('div');
        senderName.classList.add('sender-name');
        senderName.innerText = file.sender;
        messageElement.appendChild(senderName);

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = file.data;
            img.alt = file.name;
            img.style.maxWidth = '100%';
            messageElement.appendChild(img);

            const downloadLink = document.createElement('a');
            downloadLink.href = file.data;
            downloadLink.download = file.name;
            downloadLink.innerText = 'Download Image';
            messageElement.appendChild(downloadLink);
        } else if (file.type === 'text/plain') {
            const textPreview = document.createElement('p');
            const decodedText = atob(file.data.split(',')[1]);

            textPreview.innerText = decodedText.length > 100
                ? decodedText.substring(0, 100) + '...'
                : decodedText;
            textPreview.style.whiteSpace = 'pre-wrap';
            messageElement.appendChild(textPreview);

            const downloadLink = document.createElement('a');
            downloadLink.href = file.data;
            downloadLink.download = file.name;
            downloadLink.innerText = 'Download Text File';
            messageElement.appendChild(downloadLink);
        } else {
            const downloadLink = document.createElement('a');
            downloadLink.href = file.data;
            downloadLink.download = file.name;
            downloadLink.innerText = `Download ${file.name}`;
            messageElement.appendChild(downloadLink);
        }

        dmChatMessages.appendChild(messageElement);
        dmChatMessages.scrollTop = dmChatMessages.scrollHeight;
    } else {
        alert(`New file received from ${file.sender}`);
    }
});

// Check if username exists in localStorage
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('username-display').textContent = username;
} else {
    // Redirect to login if username isn't set
    window.location.href = '/login.html';
}
