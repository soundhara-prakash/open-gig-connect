import { getDB } from '../config/db.js';

const Service = {
    getCollection: () => getDB().collection('services'),

    findAll: async () => {
        return await Service.getCollection().find({}).toArray();
    },

    findByVendorId: async (vendorId) => {
        return await Service.getCollection().find({ vendorId }).toArray();
    },

    create: async (serviceData) => {
        return await Service.getCollection().insertOne(serviceData);
    },

    findById: async (id) => {
        const { ObjectId } = await import('mongodb');
        if (!id) return null;
        let objectId;
        try {
            objectId = typeof id === 'string' ? new ObjectId(id) : id;
        } catch (error) {
            return null;
        }
        return await Service.getCollection().findOne({ _id: objectId });
    }
};

export default Service;
