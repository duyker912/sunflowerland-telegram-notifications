const db = require('./config/database');

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Kiểm tra table user_crops
    const result = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_crops' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 user_crops table columns:');
    console.table(result.rows);
    
    return result.rows;
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    return null;
  }
}

module.exports = { checkSchema };
