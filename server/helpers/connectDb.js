const mongoose = require('mongoose');

const connectDB = async (DATABASE_URL) => {
    try {
        await mongoose.connect(DATABASE_URL, { 
            serverSelectionTimeoutMS: 5000
        });
        console.log("Database Connected Successfully..");
    } catch (error) {
        console.log("🚀 ~ connectDB ~ error connecting database:", error)
    }
}

module.exports = connectDB;