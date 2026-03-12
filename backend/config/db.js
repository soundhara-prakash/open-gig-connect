import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
let db;

const connectDB = async () => {
    try {
        await client.connect();
        db = client.db("easyhire");
        console.log("Connected to MongoDB");
        return db;
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
};

export { connectDB, getDB };
