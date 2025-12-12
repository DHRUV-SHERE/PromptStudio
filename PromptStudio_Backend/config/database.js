const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        
        // Show masked URI for debugging
        const maskedURI = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
        console.log('Connecting to:', maskedURI);
        
        // Simple connection for Mongoose 6+
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        console.log(`📊 Database: ${mongoose.connection.name}`);
        
        return mongoose.connection;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        
        // Detailed troubleshooting
        console.error('\n🔍 Troubleshooting steps:');
        console.error('1. Check if your MongoDB Atlas cluster is running');
        console.error('2. Verify username and password in MONGODB_URI');
        console.error('3. Add Render.com IP to MongoDB Atlas whitelist:');
        console.error('   - Go to MongoDB Atlas → Network Access');
        console.error('   - Add IP address: 0.0.0.0/0 (allow all)');
        console.error('4. Check if database user has correct permissions');
        
        process.exit(1);
    }
};

module.exports = connectDB;