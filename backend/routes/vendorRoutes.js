import express from 'express';
import { registerVendor, getVendorBookings, getVendorServices } from '../controllers/vendorController.js';
import { protect, vendorOnly } from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// The paths here will be relative to where the router is mounted
// If mounted at /api:
router.post('/vendors/register', upload.single('document'), registerVendor);
router.get('/vendor/bookings', protect, vendorOnly, getVendorBookings);
router.get('/vendor/services', protect, vendorOnly, getVendorServices);

export default router;

