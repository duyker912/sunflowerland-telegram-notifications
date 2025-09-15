// Script để fix database schema
const db = require('./config/database');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Thêm cột notification_sent nếu chưa có
    const hasNotificationSent = await db.schema.hasColumn('user_crops', 'notification_sent');
    if (!hasNotificationSent) {
      console.log('➕ Adding notification_sent column...');
      await db.schema.alterTable('user_crops', function(table) {
        table.boolean('notification_sent').defaultTo(false);
      });
      console.log('✅ Added notification_sent column');
    } else {
      console.log('✅ notification_sent column already exists');
    }
    
    // Thêm cột harvest_ready_at nếu chưa có
    const hasHarvestReadyAt = await db.schema.hasColumn('user_crops', 'harvest_ready_at');
    if (!hasHarvestReadyAt) {
      console.log('➕ Adding harvest_ready_at column...');
      await db.schema.alterTable('user_crops', function(table) {
        table.timestamp('harvest_ready_at').nullable();
      });
      console.log('✅ Added harvest_ready_at column');
    } else {
      console.log('✅ harvest_ready_at column already exists');
    }
    
    // Thêm cột is_harvested nếu chưa có
    const hasIsHarvested = await db.schema.hasColumn('user_crops', 'is_harvested');
    if (!hasIsHarvested) {
      console.log('➕ Adding is_harvested column...');
      await db.schema.alterTable('user_crops', function(table) {
        table.boolean('is_harvested').defaultTo(false);
      });
      console.log('✅ Added is_harvested column');
    } else {
      console.log('✅ is_harvested column already exists');
    }
    
    // Thêm cột sunflower_farm_id nếu chưa có
    const hasFarmId = await db.schema.hasColumn('users', 'sunflower_farm_id');
    if (!hasFarmId) {
      console.log('➕ Adding sunflower_farm_id column...');
      await db.schema.alterTable('users', function(table) {
        table.string('sunflower_farm_id').nullable();
      });
      console.log('✅ Added sunflower_farm_id column');
    } else {
      console.log('✅ sunflower_farm_id column already exists');
    }
    
    // Thêm cột blockchain_data nếu chưa có
    const hasBlockchainData = await db.schema.hasColumn('users', 'blockchain_data');
    if (!hasBlockchainData) {
      console.log('➕ Adding blockchain_data column...');
      await db.schema.alterTable('users', function(table) {
        table.json('blockchain_data').nullable();
      });
      console.log('✅ Added blockchain_data column');
    } else {
      console.log('✅ blockchain_data column already exists');
    }
    
    // Thêm cột blockchain_data cho user_crops nếu chưa có
    const hasCropBlockchainData = await db.schema.hasColumn('user_crops', 'blockchain_data');
    if (!hasCropBlockchainData) {
      console.log('➕ Adding blockchain_data column to user_crops...');
      await db.schema.alterTable('user_crops', function(table) {
        table.json('blockchain_data').nullable();
      });
      console.log('✅ Added blockchain_data column to user_crops');
    } else {
      console.log('✅ blockchain_data column already exists in user_crops');
    }
    
    // Thêm cột transaction_hash nếu chưa có
    const hasTransactionHash = await db.schema.hasColumn('user_crops', 'transaction_hash');
    if (!hasTransactionHash) {
      console.log('➕ Adding transaction_hash column...');
      await db.schema.alterTable('user_crops', function(table) {
        table.string('transaction_hash').nullable();
      });
      console.log('✅ Added transaction_hash column');
    } else {
      console.log('✅ transaction_hash column already exists');
    }
    
    // Thêm cột sent cho notifications table nếu chưa có
    const hasSentColumn = await db.schema.hasColumn('notifications', 'sent');
    if (!hasSentColumn) {
      console.log('➕ Adding sent column to notifications...');
      await db.schema.alterTable('notifications', function(table) {
        table.boolean('sent').defaultTo(false);
      });
      console.log('✅ Added sent column to notifications');
    } else {
      console.log('✅ sent column already exists in notifications');
    }
    
    console.log('🎉 Database schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
  } finally {
    await db.destroy();
  }
}

fixDatabase();
