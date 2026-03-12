import express from 'express';
import { addReview, getVendorReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/add', addReview);
router.get('/vendor/:vendorId', getVendorReviews);

export default router;
