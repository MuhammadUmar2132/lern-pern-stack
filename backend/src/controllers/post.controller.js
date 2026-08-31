import * as postQueries from '../queries/post.queries.js';

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postQueries.getAll();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await postQueries.getById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getPostsByUser = async (req, res, next) => {
  try {
    const posts = await postQueries.getByUserId(req.params.userId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { userId, title, content, imageUrl } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'userId and title are required' });
    }

    const post = await postQueries.create(userId, title, content, imageUrl);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { title, content, imageUrl } = req.body;
    const existing = await postQueries.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const post = await postQueries.update(
      req.params.id,
      title || existing.title,
      content !== undefined ? content : existing.content,
      imageUrl !== undefined ? imageUrl : existing.image_url
    );
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const deleted = await postQueries.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
