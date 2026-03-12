import express from 'express';
import { registerUser, loginUser, checkEmail, checkPhone, getUserById, toggleFavorite, getFavorites } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/check-email', checkEmail);
router.get('/check-phone', checkPhone);
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/favorites', protect, getFavorites);
router.post('/favorites', protect, toggleFavorite);
router.get('/:id', getUserById);

export default router;
