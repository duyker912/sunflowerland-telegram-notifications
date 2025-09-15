const { Client } = require('pg');

// Kết nối đến Railway PostgreSQL
const client = new Client({
  connectionString: 'postgresql://postgres:intEHNXlUBGBqrkeswqXVmZjZZUjLYkK@ballast.proxy.rlwy.net:51539/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to Railway PostgreSQL');
    
    // Kiểm tra bảng user_crops
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'user_crops' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Railway Database Schema - user_crops table:');
    console.log('===============================================');
    
    if (result.rows.length === 0) {
      console.log('❌ Table user_crops does not exist!');
      
      // Kiểm tra tất cả bảng
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log('\n📋 Available tables:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      result.rows.forEach(col => {
        console.log(`✅ ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Kiểm tra xem có cột harvest_time không
      const hasHarvestTime = result.rows.some(col => col.column_name === 'harvest_time');
      console.log(`\n🔍 harvest_time column: ${hasHarvestTime ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
