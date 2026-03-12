import { getDB } from '../config/db.js';

const User = {
    getCollection: () => getDB().collection('users'),

    findByEmail: async (email) => {
        return await User.getCollection().findOne({ email });
    },

    findById: async (id) => {
        const { ObjectId } = await import('mongodb');
        if (!id) return null;
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await User.getCollection().findOne({ _id: objectId });
        } catch (error) {
            return null;
        }
    },

    create: async (userData) => {
        return await User.getCollection().insertOne(userData);
    }
};

export default User;
