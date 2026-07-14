import express from 'express';
import db from './db.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'writenest_secret_key_123';

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
})); // Allow requests from the frontend on any port

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Signup Endpoint
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, username, email });
    });
  });
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  db.get('SELECT id, username, email, password FROM users WHERE username = ? OR email = ?', [username, username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username, email: user.email });
  });
});

// GET all posts
app.get('/posts', (req, res) => {
  db.all('SELECT id, title, content, author, created_at FROM posts ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET single post
app.get('/posts/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT id, title, content, author, created_at FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(row);
  });
});

// CREATE post (Authenticated)
app.post('/posts', authenticate, (req, res) => {
  const { title, content } = req.body;
  const author = req.user.username;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.run('INSERT INTO posts (title, content, author) VALUES (?, ?, ?)', [title, content, author], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ id: this.lastID, title, content, author });
  });
});

// UPDATE post (Authenticated & Owner checked)
app.put('/posts/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const username = req.user.username;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.get('SELECT author FROM posts WHERE id = ?', [id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author !== username) {
      return res.status(403).json({ error: 'You are not authorized to update this post' });
    }

    db.run('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, title, content, author: username });
    });
  });
});

// DELETE post (Authenticated & Owner checked)
app.delete('/posts/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const username = req.user.username;

  db.get('SELECT author FROM posts WHERE id = ?', [id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author !== username) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    db.run('DELETE FROM posts WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Post deleted successfully' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
