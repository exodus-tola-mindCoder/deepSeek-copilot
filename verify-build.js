// Simple verification script to check if the extension build is successful
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying DeepSeek Copilot build...\n');

// Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ directory does not exist');
    process.exit(1);
}
console.log('✅ dist/ directory exists');

// Check if main extension file exists
const extensionFile = path.join(distDir, 'extension.js');
if (!fs.existsSync(extensionFile)) {
    console.error('❌ dist/extension.js does not exist');
    process.exit(1);
}
console.log('✅ dist/extension.js exists');

// Check file size (should be reasonable)
const stats = fs.statSync(extensionFile);
if (stats.size < 1000) {
    console.error('❌ dist/extension.js seems too small (potential build issue)');
    process.exit(1);
}
console.log(`✅ dist/extension.js size: ${Math.round(stats.size / 1024)} KB`);

// Check if source map exists
const sourceMapFile = path.join(distDir, 'extension.js.map');
if (!fs.existsSync(sourceMapFile)) {
    console.warn('⚠️  dist/extension.js.map does not exist (source maps disabled?)');
} else {
    console.log('✅ dist/extension.js.map exists');
}

// Check if all API directories exist in dist
const apiDirs = ['api', 'providers', 'utils'];
apiDirs.forEach(dir => {
    const dirPath = path.join(distDir, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ dist/${dir}/ directory exists`);
    } else {
        console.warn(`⚠️  dist/${dir}/ directory does not exist`);
    }
});

// Verify package.json has correct main entry
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (packageJson.main !== './dist/extension.js') {
    console.error('❌ package.json main entry is incorrect');
    process.exit(1);
}
console.log('✅ package.json main entry is correct');

// Check activation events
const activationEvents = packageJson.activationEvents || [];
if (activationEvents.length === 0) {
    console.error('❌ No activation events defined');
    process.exit(1);
}
console.log(`✅ ${activationEvents.length} activation events defined`);

// Check commands
const commands = packageJson.contributes?.commands || [];
if (commands.length === 0) {
    console.error('❌ No commands defined');
    process.exit(1);
}
console.log(`✅ ${commands.length} commands defined`);

console.log('\n🎉 Build verification completed successfully!');
console.log('The extension should be ready for testing in VS Code.');
console.log('\nNext steps:');
console.log('1. Open VS Code');
console.log('2. Check if extension is installed and activated');
console.log('3. Test commands in Command Palette (Ctrl+Shift+P)');
console.log('4. Refer to MANUAL_TESTING_GUIDE.md for detailed testing steps');
