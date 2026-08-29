const db = require('../config/db');

class ItemModel {
  static async getAll() {
    const { rows } = await db.query('SELECT * FROM items ORDER BY id ASC');
    return rows;
  }

  static async getById(id) {
    const { rows } = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    return rows[0];
  }

  static async create(title, description) {
    const { rows } = await db.query(
      'INSERT INTO items (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    return rows[0];
  }

  static async update(id, title, description) {
    const { rows } = await db.query(
      'UPDATE items SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await db.query('DELETE FROM items WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = ItemModel;
