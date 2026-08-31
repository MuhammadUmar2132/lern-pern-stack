import db from '../config/db.js';

export const getAll = async () => {
  const { rows } = await db.query('SELECT * FROM items ORDER BY created_at DESC');
  return rows;
};

export const getById = async (id) => {
  const { rows } = await db.query('SELECT * FROM items WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (title, description, imageUrl) => {
  const { rows } = await db.query(
    'INSERT INTO items (title, description, image_url) VALUES ($1, $2, $3) RETURNING *',
    [title, description, imageUrl]
  );
  return rows[0];
};

export const update = async (id, title, description, imageUrl) => {
  const { rows } = await db.query(
    'UPDATE items SET title = $1, description = $2, image_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    [title, description, imageUrl, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rows } = await db.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};
