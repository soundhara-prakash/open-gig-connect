import { getDB } from '../config/db.js';

const Booking = {
    getCollection: () => getDB().collection('bookings'),

    findByUserEmail: async (email) => {
        return await Booking.getCollection().find({ userEmail: email }).toArray();
    },

    countByServiceAndDate: async (serviceId, date) => {
        return await Booking.getCollection().countDocuments({ serviceId, date });
    },

    create: async (bookingData) => {
        return await Booking.getCollection().insertOne(bookingData);
    },

    updateStatus: async (id, status) => {
        const { ObjectId } = await import('mongodb');
        return await Booking.getCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );
    },

    updateBooking: async (id, updateData) => {
        const { ObjectId } = await import('mongodb');
        return await Booking.getCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
    }
};

export default Booking;
