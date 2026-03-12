import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

// @desc    Register an admin
// @route   POST /api/admin/register
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all fields" });
        }

        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = {
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date()
        };

        const result = await User.create(newAdmin);
        const token = jwt.sign({ id: result.insertedId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token,
            user: {
                id: result.insertedId,
                name: newAdmin.name,
                email: newAdmin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error("Admin Registration Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Admin login
// @route   POST /api/admin/login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findByEmail(email);

        if (!user || user.role !== 'admin') {
            return res.status(400).json({ success: false, message: "Invalid admin credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid admin credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            message: "Admin Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get pending vendors
// @route   GET /api/admin/vendors
export const getPendingVendors = async (req, res) => {
    try {
        const vendors = await User.getCollection().find({ role: 'vendor', status: 'pending' }).toArray();
        res.json({ success: true, vendors });
    } catch (error) {
        console.error("Fetch Pending Vendors Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get active vendors
// @route   GET /api/admin/vendors/active
export const getActiveVendors = async (req, res) => {
    try {
        const vendors = await User.getCollection().find({ role: 'vendor', status: 'active' }).toArray();
        res.json({ success: true, vendors });
    } catch (error) {
        console.error("Fetch Active Vendors Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Verify vendor (Approve/Reject)
// @route   PUT /api/admin/verify-vendor/:id
export const verifyVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        const db = getDB();
        const usersCollection = User.getCollection();
        const servicesCollection = db.collection("services");
        const vendorId = new ObjectId(id);

        let update = {};
        if (action === 'approve') {
            update = { status: 'active', isVerified: true };

            const existingService = await servicesCollection.findOne({ vendorId: id });

            if (!existingService) {
                const vendor = await User.findById(id);
                if (vendor) {
                    const newService = {
                        name: vendor.serviceName || vendor.name,
                        description: `Professional ${vendor.category} services provided by ${vendor.name}`,
                        category: vendor.category || "General",
                        price: "Contact for Pricing",
                        image: vendor.documentUrl || "",
                        vendorId: id,
                        vendorName: vendor.name,
                        vendorLocation: vendor.location || "",
                        vendorPhone: vendor.phone || "",
                        createdAt: new Date()
                    };
                    await servicesCollection.insertOne(newService);
                }
            }

        } else if (action === 'reject') {
            update = { status: 'rejected', isVerified: false };
        } else if (action === 'remove') {
            update = { status: 'removed', isVerified: false };
        } else {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        await usersCollection.updateOne({ _id: vendorId }, { $set: update });

        res.json({ success: true, message: `Vendor ${action}d successfully` });

    } catch (error) {
        console.error("Verify Vendor Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete vendor and associated service
// @route   DELETE /api/admin/vendor/:id
export const deleteVendorAndService = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const usersCollection = User.getCollection();
        const servicesCollection = db.collection("services");
        const vendorObjectId = new ObjectId(id);

        // Delete the service(s) associated with this vendor
        await servicesCollection.deleteMany({ vendorId: id });

        // Delete the vendor
        const result = await usersCollection.deleteOne({ _id: vendorObjectId, role: 'vendor' });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        res.json({ success: true, message: "Vendor and associated services deleted successfully" });
    } catch (error) {
        console.error("Delete Vendor Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
    try {
        const db = getDB();
        const bookingsCollection = db.collection("bookings");
        const bookings = await bookingsCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Fetch All Bookings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update booking payment status
// @route   PUT /api/admin/booking/:id/payment
export const updateBookingPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body; // 'paid', 'pending', 'failed'
        const db = getDB();
        const bookingsCollection = db.collection("bookings");

        await bookingsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { paymentStatus: paymentStatus || 'pending' } }
        );

        res.json({ success: true, message: "Payment status updated successfully" });
    } catch (error) {
        console.error("Update Payment Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// @desc    Delete a specific service by ID
// @route   DELETE /api/admin/service/:id
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const servicesCollection = db.collection("services");

        const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        console.error("Delete Service Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
