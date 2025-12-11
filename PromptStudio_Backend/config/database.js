const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Optional: Event listeners for connection
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from DB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;