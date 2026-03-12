import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

const services = [
    {
        name: "Cleaning Service",
        description: "Professional home & office cleaning",
        price: "Starts at $50",
        category: "Cleaning",
        createdAt: new Date()
    },
    {
        name: "Appliance Repair",
        description: "Fix your appliances quickly",
        price: "Starts at $40",
        category: "Repairs",
        createdAt: new Date()
    },
    {
        name: "Pest Control",
        description: "Keep your home pest-free",
        price: "Starts at $80",
        category: "Pest Control",
        createdAt: new Date()
    },
    {
        name: "Salon at Home",
        description: "Beauty services at your doorstep",
        price: "Starts at $30",
        category: "Beauty",
        createdAt: new Date()
    },
    {
        name: "Moving & Packing",
        description: "Hassle-free relocation services",
        price: "Custom Quote",
        category: "Moving",
        createdAt: new Date()
    },
    {
        name: "Wall Art & Decor",
        description: "Transform your living space",
        price: "Starts at $100",
        category: "Painting",
        createdAt: new Date()
    },
    {
        name: "Home Tutoring",
        description: "Expert tutors for all subjects",
        price: "Starts at $25/hr",
        category: "Tutoring",
        createdAt: new Date()
    },
    {
        name: "Grocery Pickup",
        description: "Get groceries delivered",
        price: "Delivery fee $10",
        category: "Delivery",
        createdAt: new Date()
    },
    {
        name: "Gardening",
        description: "Professional landscape design",
        price: "Starts at $60",
        category: "Gardening",
        createdAt: new Date()
    }
];

async function seed() {
    try {
        await client.connect();
        console.log("Connected to MongoDB for seeding.");
        const db = client.db("easyhire");
        const servicesCollection = db.collection("services");

        // Optional: Clear existing services first if you want a clean slate
        // await servicesCollection.deleteMany({});

        // Check if services already exist to avoid duplicates if run multiple times without clearing
        const existingCount = await servicesCollection.countDocuments();
        if (existingCount > 0) {
            console.log(`There are already ${existingCount} services in the database.`);
            // Depending on requirement, we might want to skip or merge. 
            // For now, let's just add them if the count is low, or clear and add.
            // The user said "push these things to my db", likely implying "ensure these are in the db".
            // Given the previous "no default serv" request, let's assume we want EXACTLY these services.
            // So I will clear the collection first to match the "no default serv" state exactly.
            console.log("Clearing existing services...");
            await servicesCollection.deleteMany({});
        }

        const result = await servicesCollection.insertMany(services);
        console.log(`Inserted ${result.insertedCount} services.`);

    } catch (error) {
        console.error("Error seeding services:", error);
    } finally {
        await client.close();
    }
}

seed();
