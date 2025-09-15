// Debug script để kiểm tra kết nối database
require('dotenv').config();
const db = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    
    // Test connection
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Test tables
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Available tables:', tables.rows.map(r => r.table_name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
