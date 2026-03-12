import Review from '../models/reviewModel.js';
import Booking from '../models/bookingModel.js';

export const addReview = async (req, res) => {
    try {
        let { vendorId, userName, customerName, rating, comment, bookingId } = req.body;
        if (!rating) {
            return res.status(400).json({ success: false, message: "Rating is required" });
        }

        // Try to find the correct vendor ID if not provided or if it's potentially a serviceId
        if (bookingId) {
            const booking = await Booking.getCollection().findOne({ _id: new (await import('mongodb')).ObjectId(bookingId) });
            if (booking && booking.vendorId) {
                vendorId = booking.vendorId;
            } else if (booking && booking.serviceId) {
                // Fallback: Find vendor from service if booking doesn't have it
                const Service = (await import('../models/serviceModel.js')).default;
                const service = await Service.findById(booking.serviceId);
                if (service && service.vendorId) {
                    vendorId = service.vendorId;
                }
            }
        }

        if (!vendorId) {
            return res.status(400).json({ success: false, message: "Could not identify vendor for this review" });
        }

        // Use customerName if userName is not provided
        const reviewerName = userName || customerName || "Customer";

        await Review.create({
            vendorId: vendorId.toString(), // Ensure it's a string for consistency
            userName: reviewerName,
            rating,
            comment,
            bookingId
        });

        // If bookingId is provided, mark it as reviewed without changing status
        if (bookingId) {
            await Booking.updateBooking(bookingId, { isReviewed: true });
        }

        res.status(201).json({ success: true, message: "Review added successfully" });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVendorReviews = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const reviews = await Review.findByVendorId(vendorId);
        const averageRating = await Review.getAverageRating(vendorId);
        res.json({ success: true, reviews, averageRating: parseFloat(averageRating) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
