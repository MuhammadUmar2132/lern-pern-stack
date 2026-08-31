import * as itemQueries from '../queries/item.queries.js';

export const getAllItems = async (req, res, next) => {
  try {
    const items = await itemQueries.getAll();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await itemQueries.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const { title, description, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const item = await itemQueries.create(title.trim(), description, imageUrl);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { title, description, imageUrl } = req.body;
    const existing = await itemQueries.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const item = await itemQueries.update(
      req.params.id,
      title || existing.title,
      description !== undefined ? description : existing.description,
      imageUrl !== undefined ? imageUrl : existing.image_url
    );
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const deleted = await itemQueries.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
