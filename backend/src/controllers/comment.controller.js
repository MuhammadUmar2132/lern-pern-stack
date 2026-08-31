import * as commentQueries from '../queries/comment.queries.js';

export const getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await commentQueries.getByPostId(req.params.postId);
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: 'userId and message are required' });
    }

    const comment = await commentQueries.create(postId, userId, message);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    const existing = await commentQueries.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const comment = await commentQueries.update(req.params.id, message || existing.message);
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const deleted = await commentQueries.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
