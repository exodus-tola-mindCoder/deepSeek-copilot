// Test script to verify DeepSeek Copilot extension functionality
// This script can be used to test the extension after installation

import { extensions, commands as _commands } from 'vscode';

// Test if the extension is properly activated
async function testExtensionActivation() {
    console.log('Testing DeepSeek Copilot extension activation...');
    
    try {
        // Try to get the extension
        const extension = extensions.getExtension('exodus-tola.deepseek-copilot');
        
        if (!extension) {
            console.error('❌ Extension not found');
            return false;
        }
        
        if (!extension.isActive) {
            console.log('Extension found but not active. Activating...');
            await extension.activate();
        }
        
        console.log('✅ Extension activated successfully');
        
        // Test if commands are available
        const commands = await _commands.getCommands();
        const deepseekCommands = commands.filter(cmd => cmd.startsWith('deepseek-copilot.'));
        
        console.log(`📋 Found ${deepseekCommands.length} DeepSeek Copilot commands:`);
        deepseekCommands.forEach(cmd => console.log(`   - ${cmd}`));
        
        if (deepseekCommands.length >= 4) {
            console.log('✅ All expected commands are available');
            return true;
        } else {
            console.error('❌ Missing some expected commands');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error testing extension:', error.message);
        return false;
    }
}

// Run the test
testExtensionActivation().then(success => {
    if (success) {
        console.log('\n🎉 Extension test completed successfully!');
        console.log('The "command not found" issue should be resolved.');
    } else {
        console.log('\n❌ Extension test failed.');
        console.log('Check the Developer Tools console in VS Code for more details.');
    }
});
