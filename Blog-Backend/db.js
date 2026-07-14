import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'blog.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create posts table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT DEFAULT 'Anonymous',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating posts table:', err.message);
      } else {
        // Add author column to posts if it doesn't exist
        db.all("PRAGMA table_info(posts)", [], (pragmaErr, columns) => {
          if (pragmaErr) {
            console.error('Error reading posts table info:', pragmaErr.message);
            return;
          }
          const hasAuthor = columns.some(col => col.name === 'author');
          if (!hasAuthor) {
            db.run("ALTER TABLE posts ADD COLUMN author TEXT DEFAULT 'Anonymous'", (alterErr) => {
              if (alterErr) {
                console.error('Failed to add author column:', alterErr.message);
              } else {
                console.log('Successfully added author column to posts table');
              }
            });
          }
        });
      }
    });
  });
}

export default db;
