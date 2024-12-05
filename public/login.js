/*
document.getElementById('create-account-link').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('login-link').addEventListener('click', () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

// Handle Registration Form Submission
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Simulate saving user data (replace this with real backend request)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ username: newUsername, password: newPassword });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account created successfully! Please log in.');
    document.getElementById('register-form').reset();
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

// Handle Login Form Submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('username', username);
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password!');
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('username', data.username);
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password');
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
    });

    if (response.ok) {
        alert('Registration successful! Please log in.');
        document.getElementById('register-form').reset();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    } else {
        alert('User already exists or another error occurred.');
    }
    document.getElementById('create-account-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
    
});
*/