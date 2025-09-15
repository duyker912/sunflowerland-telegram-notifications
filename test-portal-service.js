// Test Portal Service với mock data
const portalService = require('./server/services/portalService');

async function testPortalService() {
  console.log('🧪 Testing Portal Service with Mock Data...');
  
  try {
    // Test 1: Kiểm tra kết nối
    console.log('\n1. Testing Portal connection...');
    const connectionResult = await portalService.testConnection();
    console.log('✅ Connection result:', JSON.stringify(connectionResult, null, 2));
    
    // Test 2: Lấy thông tin farm
    console.log('\n2. Getting player farm...');
    const farmResult = await portalService.getPlayerFarm('2749154680612546');
    console.log('✅ Farm result:', JSON.stringify(farmResult, null, 2));
    
    // Test 3: Lấy danh sách cây trồng
    console.log('\n3. Getting player crops...');
    const cropsResult = await portalService.getPlayerCrops('2749154680612546');
    console.log('✅ Crops result:', JSON.stringify(cropsResult, null, 2));
    
    // Test 4: Lấy thông tin inventory
    console.log('\n4. Getting player inventory...');
    const inventoryResult = await portalService.getPlayerInventory('2749154680612546');
    console.log('✅ Inventory result:', JSON.stringify(inventoryResult, null, 2));
    
    // Test 5: Lấy profile player
    console.log('\n5. Getting player profile...');
    const profileResult = await portalService.getPlayerProfile('2749154680612546');
    console.log('✅ Profile result:', JSON.stringify(profileResult, null, 2));
    
    // Test 6: Lấy danh sách cây trồng có sẵn
    console.log('\n6. Getting available crops...');
    const availableCropsResult = await portalService.getAvailableCrops();
    console.log('✅ Available crops result:', JSON.stringify(availableCropsResult, null, 2));
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Chạy test
testPortalService();
