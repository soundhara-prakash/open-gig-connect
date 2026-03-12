import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import User from '../models/userModel.js';
import Service from '../models/serviceModel.js';

// @desc    Add a new service
// @route   POST /api/services
export const addService = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        let vendorId = null;
        let vendorName = null;
        let vendorLocation = null;
        let vendorPhone = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'vendor') {
                    vendorId = decoded.id;
                    const vendor = await User.findById(vendorId);
                    vendorName = vendor?.name;
                    vendorLocation = vendor?.location;
                    vendorPhone = vendor?.phone;
                }
            } catch (err) {
                console.log("Token verification failed for add service, proceeding as generic/admin service", err.message);
            }
        }

        const { name, description, category, price, image } = req.body;

        if (!name || !description || !price) {
            return res.status(400).json({ success: false, message: "Please provide name, description and price" });
        }

        const newService = {
            name,
            description,
            category: category || "General",
            price,
            image: image || "",
            vendorId,
            vendorName,
            vendorLocation: vendorLocation || "",
            vendorPhone: vendorPhone || "",
            createdAt: new Date()
        };

        await Service.create(newService);
        res.status(201).json({ success: true, message: "Service added", service: newService });

    } catch (error) {
        console.error("Add Service Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all services
// @route   GET /api/services
export const getServices = async (req, res) => {
    try {
        const { location } = req.query;
        let services = await Service.findAll();

        const vendorIds = services
            .map(s => s.vendorId)
            .filter(id => id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));

        const uniqueVendorIds = [...new Set(vendorIds)];

        if (uniqueVendorIds.length > 0) {
            const vendors = await User.getCollection().find({
                _id: { $in: uniqueVendorIds.map(id => new ObjectId(id)) }
            }).toArray();

            const vendorMap = {};
            vendors.forEach(v => {
                vendorMap[v._id.toString()] = v;
            });

            services = services.map(s => {
                if (s.vendorId && vendorMap[s.vendorId]) {
                    const v = vendorMap[s.vendorId];
                    return {
                        ...s,
                        vendorLocation: v.location || s.vendorLocation || "",
                        vendorPhone: v.phone || s.vendorPhone || "",
                        vendorName: v.name || s.vendorName || ""
                    };
                }
                return s;
            });
        }
        if (location) {
            services.sort((a, b) => {
                const aMatch = (a.vendorLocation || "").toLowerCase() === location.toLowerCase();
                const bMatch = (b.vendorLocation || "").toLowerCase() === location.toLowerCase();
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
        }

        res.json({ success: true, services });
    } catch (error) {
        console.error("Get Services Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
