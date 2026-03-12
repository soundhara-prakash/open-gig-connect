import { getDB } from '../config/db.js';

const Review = {
    getCollection: () => getDB().collection('reviews'),

    findByVendorId: async (vendorId) => {
        const { ObjectId } = await import('mongodb');
        const query = {
            $or: [
                { vendorId: vendorId.toString() },
                { vendorId: typeof vendorId === 'string' ? new ObjectId(vendorId) : vendorId }
            ]
        };
        return await Review.getCollection().find(query).toArray();
    },

    create: async (reviewData) => {
        const data = {
            ...reviewData,
            createdAt: new Date()
        };
        return await Review.getCollection().insertOne(data);
    },

    getAverageRating: async (vendorId) => {
        const reviews = await Review.findByVendorId(vendorId);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        return (sum / reviews.length).toFixed(1);
    }
};

export default Review;
