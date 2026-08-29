const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Initialize table if it doesn't exist
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
