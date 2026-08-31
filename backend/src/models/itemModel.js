const { query } = require('../config/db').default.default;

const migrationSQL = `
  CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const getAll = async () => {
  const result = await query('SELECT * FROM items ORDER BY id ASC');
  return result.rows;
};

const getById = async (id) => {
  const result = await query('SELECT * FROM items WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async (title, description, imageUrl) => {
  const result = await query(
    'INSERT INTO items (title, description, image_url) VALUES ($1, $2, $3) RETURNING *',
    [title, description, imageUrl || null]
  );
  return result.rows[0];
};

const update = async (id, title, description, imageUrl) => {
  const result = await query(
    'UPDATE items SET title = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *',
    [title, description, imageUrl || null, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
};

module.exports = {
  migrationSQL,
  getAll,
  getById,
  create,
  update,
  remove,
};
