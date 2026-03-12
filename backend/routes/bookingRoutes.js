import express from 'express';
import { createBooking, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// These will be mounted at /api
router.post('/bookings', createBooking);
router.get('/user/bookings', protect, getUserBookings);
router.put('/bookings/:id/status', protect, updateBookingStatus);

export default router;

