import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (await import('../controllers/itemController.js')).getItems);
router.get('/:id', (await import('../controllers/itemController.js')).getItem);
router.post('/', (await import('../controllers/itemController.js')).createItem);
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'crud-items' },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Image upload failed' });
  }
});
router.put('/:id', (await import('../controllers/itemController.js')).updateItem);
router.delete('/:id', (await import('../controllers/itemController.js')).deleteItem);

export default router;
