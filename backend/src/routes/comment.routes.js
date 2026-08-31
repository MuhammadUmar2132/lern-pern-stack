import express from 'express';
import * as commentController from '../controllers/comment.controller.js';

const router = express.Router();

router.get('/post/:postId', commentController.getCommentsByPost);
router.post('/post/:postId', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

export default router;
