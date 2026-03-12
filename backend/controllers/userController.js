import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

// @desc    Check if email exists
// @route   GET /api/users/check-email
export const checkEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(200).json({ exists: true, message: "Email already exists" });
        }

        res.status(200).json({ exists: false, message: "Email is available" });
    } catch (error) {
        console.error("Check Email Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Check if phone exists
// @route   GET /api/users/check-phone
export const checkPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const existingUser = await User.getCollection().findOne({ phone });

        if (existingUser) {
            return res.status(200).json({ exists: true, message: "Phone number already exists" });
        }

        res.status(200).json({ exists: false, message: "Phone number is available" });
    } catch (error) {
        console.error("Check Phone Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Register a new user
// @route   POST /api/users
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, location } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all fields" });
        }

        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            email,
            phone: phone || "",
            location: location || "",
            password: hashedPassword,
            role: role || 'customer',
            status: 'active', // Default status for customers
            favorites: [],
            createdAt: new Date()
        };

        const result = await User.create(newUser);

        // Generate Token
        const token = jwt.sign({ id: result.insertedId, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: result.insertedId,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                location: newUser.location,
                status: newUser.status
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                category: user.category,
                serviceName: user.serviceName,
                location: user.location || ""
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({

            success: true, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                category: user.category,
                serviceName: user.serviceName,
                isVerified: user.isVerified,
                location: user.location || ""
            }
        });
    } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Toggle favorite service
// @route   POST /api/users/favorites
export const toggleFavorite = async (req, res) => {
    try {
        const { serviceId } = req.body;
        const userId = req.user._id;

        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required" });
        }

        // Use the user already partially populated in req.user, but fetch fresh if needed
        // Actually, req.user from 'protect' middleware is fresh from DB per request
        const favorites = (req.user && req.user.favorites) ? req.user.favorites : [];

        const serviceIdToToggle = serviceId.toString();

        let updatedFavorites;
        let message;

        if (favorites.includes(serviceIdToToggle)) {
            updatedFavorites = favorites.filter(id => id !== serviceIdToToggle);
            message = "Removed from favorites";
        } else {
            updatedFavorites = [...favorites, serviceIdToToggle];
            message = "Added to favorites";
        }

        const { ObjectId } = await import('mongodb');
        await User.getCollection().updateOne(
            { _id: userId },
            { $set: { favorites: updatedFavorites } }
        );

        res.json({ success: true, message, favorites: updatedFavorites });
    } catch (error) {
        console.error("Toggle Favorite Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get favorites
// @route   GET /api/users/favorites
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const favorites = user.favorites || [];

        // Check if we should return the full service objects
        const { populate } = req.query;

        if (populate === 'true' && favorites.length > 0) {
            const Service = (await import('../models/serviceModel.js')).default;
            const fullServices = await Service.getCollection().find({
                _id: { $in: favorites.map(id => new ObjectId(id)) }
            }).toArray();
            return res.json({ success: true, favorites: fullServices });
        }

        res.json({ success: true, favorites });
    } catch (error) {
        console.error("Get Favorites Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
