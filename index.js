const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, 'src', 'index.js');
console.log('🔍 Render Entry Point Check:');
console.log('Current WorkDir:', process.cwd());
console.log('Looking for:', target);

if (fs.existsSync(target)) {
    console.log('✅ Found src/index.js. Starting app...');
    require(target);
} else {
    console.error('❌ CRITICAL: src/index.js NOT found!');
    console.log('Root Directory Contents:', fs.readdirSync(__dirname));
    if (fs.existsSync(path.join(__dirname, 'src'))) {
        console.log('src/ Directory Contents:', fs.readdirSync(path.join(__dirname, 'src')));
    }
    process.exit(1);
}
