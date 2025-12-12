const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔗 Attempting to connect to MongoDB Atlas...');
        
        // Debug: Check if environment variable exists
        console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        
        // Connection options for better performance and stability
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority'
        };
        
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`📈 Port: ${conn.connection.port}`);
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        
        // More detailed error information
        if (error.name === 'MongooseServerSelectionError') {
            console.error('🔍 Possible causes:');
            console.error('1. Incorrect password in MONGODB_URI');
            console.error('2. IP not whitelisted in MongoDB Atlas');
            console.error('3. Network connectivity issues');
            console.error('4. Database cluster is paused or down');
        }
        
        process.exit(1);
    }
};

// Event listeners for connection
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from DB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;