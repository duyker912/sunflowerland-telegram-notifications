const https = require('https');

// Kiểm tra schema database production
const checkSchema = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sunflowerland-telegram-notifications-production.up.railway.app',
      port: 443,
      path: '/api/check-schema',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Kiểm tra và hiển thị schema
checkSchema()
  .then(result => {
    if (result.success && result.data) {
      console.log('📊 Database Schema - user_crops table:');
      console.log('=====================================');
      result.data.forEach(col => {
        console.log(`✅ ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Kiểm tra xem có cột harvest_time không
      const hasHarvestTime = result.data.some(col => col.column_name === 'harvest_time');
      const hasHarvestReadyAt = result.data.some(col => col.column_name === 'harvest_ready_at');
      
      console.log('\n🔍 Analysis:');
      console.log(`- harvest_time column: ${hasHarvestTime ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`- harvest_ready_at column: ${hasHarvestReadyAt ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (!hasHarvestTime && !hasHarvestReadyAt) {
        console.log('\n⚠️  WARNING: Neither harvest_time nor harvest_ready_at column exists!');
        console.log('Need to run migration to add the missing column.');
      } else if (!hasHarvestTime && hasHarvestReadyAt) {
        console.log('\n💡 INFO: Using harvest_ready_at column instead of harvest_time');
      }
    } else {
      console.log('❌ Error getting schema:', result);
    }
  })
  .catch(error => {
    console.error('❌ Request failed:', error.message);
  });
