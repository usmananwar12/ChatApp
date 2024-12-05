const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

const UNIVERSAL_PASSWORD = 'ChatAppSecure123';

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username && password === UNIVERSAL_PASSWORD) {
        localStorage.setItem('username', username); 
        window.location.href = '/chat'; 
    } else {
        errorMsg.style.display = 'block'; 
        errorMsg.innerText = 'Invalid username or password';
    }
});
