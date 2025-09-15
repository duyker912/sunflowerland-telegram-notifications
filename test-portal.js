// Test Portal API cho Sunflower Land
const axios = require('axios');

// Cấu hình Portal
const PORTAL_CONFIG = {
  portalId: 'telegram-bot',
  apiUrl: 'https://api-dev.sunflower-land.com',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHhiNzA5NkIxMTZjZGYxMDExM0ZmN2QzNkE2NGI0QkI3M2Y1NjJiM0U3IiwiZmFybUlkIjoyNzQ5MTU0NjgwNjEyNTQ2LCJ1c2VyQWNjZXNzIjp7InN5bmMiOnRydWUsIndpdGhkcmF3Ijp0cnVlLCJtaW50Q29sbGVjdGlibGUiOnRydWUsImNyZWF0ZUZhcm0iOnRydWUsInZlcmlmaWVkIjp0cnVlfSwiaWF0IjoxNzU2NDk5OTcwLCJleHAiOjE3NTkwOTE5NzB9.KwSrzLC_O4mKk041d1Xsu2h5daZPzYf9Wib7hj6-jeM'
};

// Test Portal API
async function testPortalAPI() {
  console.log('🧪 Testing Portal API...');
  
  try {
    // Test 1: Kiểm tra kết nối
    console.log('\n1. Testing API connection...');
    const response = await axios.get(`${PORTAL_CONFIG.apiUrl}/portal/${PORTAL_CONFIG.portalId}/player`, {
      headers: {
        'Authorization': `Bearer ${PORTAL_CONFIG.jwtToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API connection successful!');
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    // Test 2: Lấy thông tin player
    console.log('\n2. Getting player info...');
    if (response.data && response.data.farm) {
      const farm = response.data.farm;
      console.log('🏡 Farm ID:', farm.id);
      console.log('👤 Player ID:', farm.playerId);
      console.log('🌾 Crops count:', Object.keys(farm.crops || {}).length);
      
      // Test 3: Lấy danh sách cây trồng
      console.log('\n3. Getting crops list...');
      if (farm.crops) {
        Object.entries(farm.crops).forEach(([key, crop]) => {
          if (crop && crop.plantedAt) {
            console.log(`🌱 Crop ${key}:`, {
              name: crop.name || 'Unknown',
              plantedAt: new Date(crop.plantedAt).toLocaleString(),
              harvestTime: crop.harvestedAt ? new Date(crop.harvestedAt).toLocaleString() : 'Not ready',
              status: crop.harvestedAt ? 'Harvested' : 'Growing'
            });
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.response) {
      console.error('📊 Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    // Thử với endpoint khác
    console.log('\n🔄 Trying alternative endpoint...');
    try {
      const altResponse = await axios.get(`${PORTAL_CONFIG.apiUrl}/portal/${PORTAL_CONFIG.portalId}/player`, {
        headers: {
          'Authorization': `Bearer ${PORTAL_CONFIG.jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Alternative endpoint successful!');
      console.log('📊 Response data:', JSON.stringify(altResponse.data, null, 2));
      
    } catch (altError) {
      console.error('❌ Alternative endpoint also failed:', altError.message);
    }
  }
}

// Chạy test
testPortalAPI();
