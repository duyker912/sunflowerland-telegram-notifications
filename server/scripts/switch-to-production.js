// Script để chuyển từ mock data sang production API
const fs = require('fs');
const path = require('path');

console.log('🚀 Switching to Production Mode...');

// 1. Cập nhật SunflowerLandService
const sunflowerServicePath = path.join(__dirname, '../services/sunflowerLandService.js');
let sunflowerServiceContent = fs.readFileSync(sunflowerServicePath, 'utf8');

// Thay đổi useMockData từ true sang false
sunflowerServiceContent = sunflowerServiceContent.replace(
  'this.useMockData = true;',
  'this.useMockData = false;'
);

fs.writeFileSync(sunflowerServicePath, sunflowerServiceContent);
console.log('✅ Updated SunflowerLandService to use real API');

// 2. Cập nhật Portal Service
const portalServicePath = path.join(__dirname, '../services/portalService.js');
let portalServiceContent = fs.readFileSync(portalServicePath, 'utf8');

// Thêm logic để detect production mode
const productionLogic = `
  // Production mode detection
  this.useRealAPI = process.env.SUNFLOWER_JWT_TOKEN && 
                   process.env.SUNFLOWER_JWT_TOKEN !== 'your_jwt_token_here' &&
                   process.env.SUNFLOWER_JWT_TOKEN.length > 50;
`;

// Thêm vào constructor
portalServiceContent = portalServiceContent.replace(
  'constructor() {',
  `constructor() {${productionLogic}`
);

fs.writeFileSync(portalServicePath, portalServiceContent);
console.log('✅ Updated PortalService with production detection');

// 3. Cập nhật environment variables
const envPath = path.join(__dirname, '../env.production');
let envContent = fs.readFileSync(envPath, 'utf8');

// Thêm comment về production setup
const productionComment = `
# Production Configuration
# Để chuyển sang production, cập nhật JWT token thật:
# SUNFLOWER_JWT_TOKEN=your_real_jwt_token_from_game
# 
# Sau đó chạy: node scripts/switch-to-production.js
`;

envContent = productionComment + envContent;
fs.writeFileSync(envPath, envContent);
console.log('✅ Updated environment configuration');

// 4. Tạo production checklist
const checklistPath = path.join(__dirname, '../PRODUCTION_CHECKLIST.md');
const checklistContent = `# Production Checklist

## ✅ Completed
- [x] SunflowerLandService switched to real API
- [x] PortalService updated with production detection
- [x] Environment configuration updated

## 🔧 Manual Steps Required
- [ ] Update SUNFLOWER_JWT_TOKEN with real token from game
- [ ] Update TELEGRAM_BOT_TOKEN with real bot token
- [ ] Test API connection: curl -X GET "/api/test-sunflower"
- [ ] Test Telegram bot: /start command
- [ ] Verify frontend shows real data
- [ ] Test notification system

## 🚨 Important Notes
- JWT tokens expire, need to refresh periodically
- Monitor API rate limits
- Check Telegram webhook status
- Verify database migrations

## 📊 Health Checks
- Health endpoint: /health
- Schema check: /api/check-schema
- Notification test: /api/test-notification
`;

fs.writeFileSync(checklistPath, checklistContent);
console.log('✅ Created production checklist');

console.log('\n🎉 Production setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update SUNFLOWER_JWT_TOKEN in Railway dashboard');
console.log('2. Update TELEGRAM_BOT_TOKEN in Railway dashboard');
console.log('3. Deploy to Railway');
console.log('4. Test all endpoints');
console.log('5. Check production checklist: server/PRODUCTION_CHECKLIST.md');
console.log('\n🚀 Ready for production!');
