import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const db = getDB();
            const user = await db.collection("users").findOne(
                { _id: new ObjectId(decoded.id) },
                { projection: { password: 0 } }
            );

            if (!user) {
                return res.status(401).json({ success: false, message: "Not authorized, user not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Not authorized as an admin" });
    }
};

export const vendorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Not authorized as a vendor" });
    }
};
