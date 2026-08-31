import express from 'express';
import * as itemController from '../controllers/item.controller.js';
import { upload, uploadToCloudinary } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.post('/', itemController.createItem);
router.post('/upload', upload.single('image'), uploadToCloudinary);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
