import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectCloudinary from "./config/cloudinary.js";
import { connectDB } from "./config/db.js";

// Routes
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

// Initialize App
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api', vendorRoutes); // Handles /api/vendors/register and /api/vendor/...
app.use('/api', bookingRoutes); // Handles /api/bookings and /api/user/bookings
app.use('/api/reviews', reviewRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send("API is working");
});

// Start Server
const startServer = async () => {
    try {
        await connectCloudinary();
        await connectDB();

        app.listen(port, () => {
            console.log(`Server started on PORT: ${port}`);
        });
    } catch (error) {
        console.error("Server Startup Error:", error);
        process.exit(1);
    }
};

startServer();
