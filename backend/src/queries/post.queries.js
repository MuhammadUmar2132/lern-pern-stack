import db from '../config/db.js';

export const getAll = async () => {
  const { rows } = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
  return rows;
};

export const getById = async (id) => {
  const { rows } = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
  return rows[0];
};

export const getByUserId = async (userId) => {
  const { rows } = await db.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows;
};

export const create = async (userId, title, content, imageUrl) => {
  const { rows } = await db.query(
    'INSERT INTO posts (user_id, title, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, title, content, imageUrl]
  );
  return rows[0];
};

export const update = async (id, title, content, imageUrl) => {
  const { rows } = await db.query(
    'UPDATE posts SET title = $1, content = $2, image_url = $3 WHERE id = $4 RETURNING *',
    [title, content, imageUrl, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rows } = await db.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};
