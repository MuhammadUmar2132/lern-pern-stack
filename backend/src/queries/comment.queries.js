import db from '../config/db.js';

export const getByPostId = async (postId) => {
  const { rows } = await db.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC', [postId]);
  return rows;
};

export const getById = async (id) => {
  const { rows } = await db.query('SELECT * FROM comments WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (postId, userId, message) => {
  const { rows } = await db.query(
    'INSERT INTO comments (post_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
    [postId, userId, message]
  );
  return rows[0];
};

export const update = async (id, message) => {
  const { rows } = await db.query(
    'UPDATE comments SET message = $1 WHERE id = $2 RETURNING *',
    [message, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rows } = await db.query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};
