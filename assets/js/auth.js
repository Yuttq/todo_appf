document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    const showMessage = (text, isError = false) => {
        messageDiv.textContent = text;
        messageDiv.className = isError ? 'message error' : 'message success';
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('backend/auth/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                showMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 1500);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (username.length < 3) {
                showMessage('Username must be at least 3 characters', true);
                return;
            }

            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', true);
                return;
            }

            try {
                const response = await fetch('backend/auth/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }

                showMessage('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'login.php';
                }, 1500);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }
});