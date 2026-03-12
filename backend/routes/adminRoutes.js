import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    getPendingVendors,
    getActiveVendors,
    verifyVendor,
    deleteVendorAndService,
    getAllBookings,
    updateBookingPaymentStatus,
    deleteService
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected Admin Routes
router.get('/vendors', protect, adminOnly, getPendingVendors);
router.get('/vendors/active', protect, adminOnly, getActiveVendors);
router.put('/verify-vendor/:id', protect, adminOnly, verifyVendor);
router.delete('/vendor/:id', protect, adminOnly, deleteVendorAndService);
router.delete('/service/:id', protect, adminOnly, deleteService); // Added this

// Booking management for admin
router.get('/bookings', protect, adminOnly, getAllBookings);
router.put('/booking/:id/payment', protect, adminOnly, updateBookingPaymentStatus);

export default router;
