document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = '/home';
        } else {
            if (response.headers.get('Content-Type') === 'application/json' && response.body) {
                const errorMessage = await response.json();
                alert(errorMessage.message); 
            } else {
                alert('Login failed due to response');
            }
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed');
    }
});

document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-user_email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            window.location.href = '/home';
        } else {
            const errorMessage = await response.json();
            alert(errorMessage.message); 
        }
    } catch (error) {
        console.error('Error signing up:', error);
        alert('Signup failed');
    }
});