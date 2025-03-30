// Регистрация
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    const msgDiv = document.getElementById('registerMessage');
    msgDiv.textContent = result.message;
    msgDiv.style.color = response.ok ? 'green' : 'red';
});

// Вход
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    const msgDiv = document.getElementById('loginMessage');
    msgDiv.textContent = result.message || (response.ok ? 'Успешный вход!' : 'Ошибка входа');
    msgDiv.style.color = response.ok ? 'green' : 'red';
    
    if (response.ok) {
        localStorage.setItem('jwtToken', result.token);
    }
});

// Получение защищенных данных
async function getProtectedData() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        document.getElementById('protectedData').textContent = 'Требуется авторизация!';
        return;
    }
    
    const response = await fetch('/api/protected', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    console.log(result)
    const dataDiv = document.getElementById('protectedData');
    if (response.ok) {
        dataDiv.innerHTML = `<strong>Пароль:</strong> ${result.user.password}<br>
                            <strong>JWT:</strong> ${token}<br>
                            <strong>Пользователь:</strong> ${result.user.username}`;
        dataDiv.style.color = 'green';
    } else {
        dataDiv.textContent = 'Ошибка доступа';
        dataDiv.style.color = 'red';
    }
}