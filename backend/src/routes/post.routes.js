import express from 'express';
import * as postController from '../controllers/post.controller.js';
import { upload, uploadToCloudinary } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getPostsByUser);
router.post('/', postController.createPost);
router.post('/upload', upload.single('image'), uploadToCloudinary);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;
