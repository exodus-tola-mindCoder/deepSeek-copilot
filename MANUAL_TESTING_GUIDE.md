# DeepSeek Copilot - Manual Testing Guide

## Step 1: Verify Extension Installation
1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "DeepSeek Copilot"
4. Verify it's installed and enabled
5. Check the version is 1.1.0

## Step 2: Test Command Availability
1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "DeepSeek Copilot" and verify these commands appear:
   - DeepSeek Copilot: Set API Key
   - DeepSeek Copilot: Clear API Key  
   - DeepSeek Copilot: Explain Selected Code
   - DeepSeek Copilot: Get Code Suggestion

## Step 3: Test API Key Functionality
1. Run "DeepSeek Copilot: Set API Key" command
2. Enter a test API key (should start with "sk-" and be at least 32 characters)
3. Verify the status bar changes to checkmark icon
4. Run "DeepSeek Copilot: Clear API Key" command
5. Verify the status bar changes back to key icon

## Step 4: Test Code Explanation
1. Open a code file (JavaScript, Python, etc.)
2. Select some code
3. Run "DeepSeek Copilot: Explain Selected Code" command
4. Verify a webview panel opens with explanation
5. Test with Ctrl+Alt+E (Cmd+Alt+E on Mac) keyboard shortcut

## Step 5: Test Code Suggestion
1. Open a code file
2. Place cursor or select code
3. Run "DeepSeek Copilot: Get Code Suggestion" command
4. Verify suggestions are applied to the editor
5. Test with Ctrl+Alt+S (Cmd+Alt+S on Mac) keyboard shortcut

## Step 6: Test Configuration
1. Open VS Code Settings (Ctrl+, or Cmd+,)
2. Search for "DeepSeek Copilot" settings
3. Verify all configuration options are available:
   - Provider selection (DeepSeek, OpenAI, Addis AI)
   - API Key
   - Max Tokens
   - Enable Inline
   - Suggestion Delay
   - Context Lines
   - Model
   - Temperature
   - Timeout
   - Rate Limit Delay
   - Cache TTL

## Step 7: Test Provider Switching
1. Change provider setting to each option:
   - "deepseek"
   - "openai" 
   - "addis-ai"
2. Verify the extension adapts to each provider

## Step 8: Test Error Handling
1. Try setting invalid API keys
2. Test with no internet connection
3. Verify proper error messages are shown

## Expected Results
- ✅ All commands should be available in Command Palette
- ✅ Status bar should show appropriate icons
- ✅ Webview panels should open for explanations
- ✅ Code suggestions should be applied to editor
- ✅ Configuration settings should be accessible
- ✅ Error messages should be user-friendly

## Troubleshooting
If commands are not found:
1. Check Developer Tools console (Help > Toggle Developer Tools)
2. Look for activation errors
3. Verify extension is properly activated
4. Check if there are any compilation errors in the logs
