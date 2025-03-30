const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

let users = [];

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: Date.now().toString(), username, password: hashedPassword });
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Неверные данные' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(401).json({ message: 'Неверные данные' });

  const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
  res.json({ token });
});

// Middleware проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Защищенный маршрут
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Защищенные данные',
    user: users.find(u => u.id === req.user.userId)
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));