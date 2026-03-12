import { getDB } from '../config/db.js';
import Booking from '../models/bookingModel.js';

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
    try {
        const { serviceId, serviceName, vendorId, vendorName, date, time, userEmail, userName, address, paymentMethod, price } = req.body;

        if (!serviceId || !date || !time || !userEmail || !address) {
            return res.status(400).json({ success: false, message: "Please provide all booking details" });
        }

        // Check availability (Max 5 slots per service per day)
        const bookingCount = await Booking.countByServiceAndDate(serviceId, date);

        if (bookingCount >= 5) {
            return res.status(400).json({ success: false, message: "No slots available for this service on the selected date. Please choose another date." });
        }

        const newBooking = {
            serviceId,
            serviceName,
            vendorId,
            vendorName: vendorName || "Verified Provider",
            date,
            time,
            userEmail,
            userName,
            address,
            paymentMethod,
            price,
            status: 'pending',
            createdAt: new Date()
        };

        const result = await Booking.create(newBooking);

        res.status(201).json({ success: true, message: "Booking created successfully", bookingId: result.insertedId });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get logged in user's bookings
// @route   GET /api/user/bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user; // From protect middleware

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const bookings = await Booking.findByUserEmail(user.email);

        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Get User Bookings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        const result = await Booking.updateStatus(id, status);

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, message: `Booking marked as ${status}` });
    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
