import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const sanitizedUri = process.env.MONGO_URI.replace(/\/+$/, "");
        const connectionString = `${sanitizedUri}/${DB_NAME}`;
        console.log("MongoDB connection string:", connectionString); // Debug log
        const connectionInstance = await mongoose.connect(connectionString);
        //this is done to check on which host our db is connected
    } catch (err) {
        console.log("Error connecting to MongoDB", err);
        process.exit(1);
    }
}

export default connectDB;