import db from '../config/db.js';

export const getAll = async () => {
  const { rows } = await db.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
  return rows;
};

export const getById = async (id) => {
  const { rows } = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
  return rows[0];
};

export const getByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const create = async (name, email, passwordHash) => {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name, email, passwordHash]
  );
  return rows[0];
};

export const update = async (id, name, email) => {
  const { rows } = await db.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
    [name, email, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return rows[0];
};

export default { getAll, getById, getByEmail, create, update, remove };
