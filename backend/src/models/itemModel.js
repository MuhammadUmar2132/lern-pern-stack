const { query } = require('../config/db');

class ItemModel {
  static async getAll() {
    const { rows } = await query('SELECT * FROM items ORDER BY id ASC');
    return rows;
  }

  static async getById(id) {
    const { rows } = await query('SELECT * FROM items WHERE id = $1', [id]);
    return rows[0];
  }

  static async create(title, description) {
    const { rows } = await query(
      'INSERT INTO items (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    return rows[0];
  }

  static async update(id, title, description) {
    const { rows } = await query(
      'UPDATE items SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await query('DELETE FROM items WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = ItemModel;
