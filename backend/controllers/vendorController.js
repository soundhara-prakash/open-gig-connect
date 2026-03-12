import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/userModel.js';
import Service from '../models/serviceModel.js';

// @desc    Register a vendor
// @route   POST /api/vendors/register
export const registerVendor = async (req, res) => {
    try {
        const { name, email, phone, password, serviceName, category, location } = req.body;

        if (!name || !email || !password || !phone || !req.file) {
            return res.status(400).json({ success: false, message: "Please provide all fields and a document" });
        }

        const existingUser = await User.getCollection().findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email or Phone already registered" });
        }

        // Upload Document to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'image',
            folder: 'vendor_docs'
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newVendor = {
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'vendor',
            status: 'pending',
            serviceName: serviceName || "",
            category: category || "General",
            location: location || "",
            documentUrl: cloudinaryResult.secure_url,
            isVerified: false,
            createdAt: new Date()
        };

        const result = await User.create(newVendor);
        const token = jwt.sign({ id: result.insertedId, role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            success: true,
            message: "Vendor registered successfully. Pending verification.",
            token,
            user: {
                id: result.insertedId,
                name: newVendor.name,
                email: newVendor.email,
                role: 'vendor',
                status: 'pending',
                category: newVendor.category,
                serviceName: newVendor.serviceName
            }
        });

    } catch (error) {
        console.error("Vendor Register Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

// @desc    Get vendor's bookings
// @route   GET /api/vendor/bookings
export const getVendorBookings = async (req, res) => {
    try {
        const decoded = req.user; // From protect middleware

        if (decoded.role !== 'vendor') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const vendor = await User.findById(decoded._id);

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        const vendorServices = await Service.findByVendorId(decoded._id.toString());
        const vendorServiceIds = vendorServices.map(s => s._id.toString());

        const bookingsCollection = getDB().collection("bookings");
        const bookings = await bookingsCollection.find({
            $or: [
                { serviceId: { $in: vendorServiceIds } },
                { serviceName: { $regex: vendor.serviceName || "", $options: 'i' } },
            ]
        }).toArray();

        res.json({ success: true, bookings });

    } catch (error) {
        console.error("Get Vendor Bookings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get vendor's services
// @route   GET /api/vendor/services
export const getVendorServices = async (req, res) => {
    try {
        const decoded = req.user; // From protect middleware

        if (decoded.role !== 'vendor') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const services = await Service.findByVendorId(decoded._id.toString());

        res.json({ success: true, services });

    } catch (error) {
        console.error("Get Vendor Services Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
