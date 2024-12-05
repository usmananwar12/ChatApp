const socket = io('http://192.168.18.17:8000');

const form = document.getElementById('message-input');
const messageInput = document.getElementById('message');
const messageContainer = document.querySelector(".chat-box");
var msg = new Audio('alert.mp3');
var join_left = new Audio('Leave.mp3');


const append = (message, position, sender) => {
    // new message
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(position); 

    // Add sender name
    if (sender) {
        const senderName = document.createElement('div');
        senderName.classList.add('sender-name');
        senderName.innerText = sender;
        messageElement.append(senderName); 
    }

    // Create the paragraph for the message text
    const messageText = document.createElement('p');
    messageText.innerText = message;
    messageElement.append(messageText);

    // Create the timestamp for the message
    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // This will show the time as HH:MM AM/PM
    messageElement.append(timestamp);

    // Append the new message to the message container
    messageContainer.append(messageElement);

    // Scroll to the bottom of the chat
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if(position == 'user-joined'){        
        join_left.play();
    }
    else if(position == 'incoming'){        
        msg.play();
    }
};

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const message = messageInput.value.trim(); // Trim whitespace from the input

    if (message) {
        append(message, 'outgoing', 'You'); // Append the message with sender name 'You'
        socket.emit('send', message); // Emit the message to the server
        messageInput.value = ''; // Clear the input after sending
    }
});

const name = prompt("Enter your name to join");
if (length.name < 1){
    name = prompt("please enter your name to join!!!")
}
socket.emit('new-user-joined', name);

socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'user-joined');
});

socket.on('recieve', (data) => {
    append(data.message, 'incoming', data.name); 
});

socket.on('left', name => {
    append(`${name} left the chat`, 'user-joined');
})


socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'user-joined');
});

socket.on('left', (name) => {
    append(`${name} left the chat`, 'user-joined');
});



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
        reader.readAsDataURL(file); // Convert file to Base64 for transport
    }
});


socket.on('receive-file', (file) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'incoming');

    // Sender's Name
    const senderName = document.createElement('div');
    senderName.classList.add('sender-name');
    senderName.innerText = file.sender;
    messageElement.append(senderName);

    if (file.type.startsWith('image/')) {
        // Image Preview
        const img = document.createElement('img');
        img.src = file.data; // Base64 data URL for image
        img.alt = file.name;
        img.style.maxWidth = '100%'; // Image styling
        messageElement.append(img);

        // Download Link for Image
        const downloadLink = document.createElement('a');
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        downloadLink.innerText = 'Download Image';
        messageElement.append(downloadLink);
    } else if (file.type === 'text/plain') {
        // Text Preview (Base64 decoding)
        const textPreview = document.createElement('p');
        const decodedText = atob(file.data.split(',')[1]); // Decode base64 text
        
        textPreview.innerText = decodedText.length > 100
            ? decodedText.substring(0, 100) + '...'
            : decodedText;
        textPreview.style.whiteSpace = 'pre-wrap'; // Maintain formatting
        messageElement.append(textPreview);

        // Download Link for Text File
        const downloadLink = document.createElement('a');
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        downloadLink.innerText = 'Download Text File';
        messageElement.append(downloadLink);
    } else {
        // For other file types (audio, pdf, etc.)
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
// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
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
        e.preventDefault(); // Prevent default to avoid any button trigger
        form.dispatchEvent(new Event('submit')); // Manually trigger form submit
    }
});

//for logout botton
const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {

    localStorage.removeItem('username');
    socket.emit('disconnect1');
    
    //if (window.close) {
      //  window.close(); 
    //} else {
        window.location.href = 'https://www.google.com'; 
    //}
});
