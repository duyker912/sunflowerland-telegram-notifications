const db = require('./server/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Kiểm tra table user_crops
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_crops' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 user_crops table columns:');
    console.table(columns.rows);
    
    // Kiểm tra table users
    const userColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 users table columns:');
    console.table(userColumns.rows);
    
    // Kiểm tra table crops
    const cropColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'crops' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 crops table columns:');
    console.table(cropColumns.rows);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
