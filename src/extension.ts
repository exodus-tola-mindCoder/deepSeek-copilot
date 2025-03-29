import * as vscode from 'vscode';
import { AuthService } from './api/auth';
import { registerCompletionProvider } from './providers/completion';
import { registerExplainCommand } from './providers/explain';
import { registerInlineCompletionProvider } from './providers/inline';

export async function activate(context: vscode.ExtensionContext) {
        console.log('DeepSeek Copilot activating...'); 
    try {
        // Initialize auth service
        AuthService.init(context);
        console.log('Registered commands:', vscode.commands.getCommands());

        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand('deepseek-copilot.setApiKey', async () => {
                try {
                    await AuthService.clearApiKey();
                    const newKey = await AuthService.promptForApiKey();
                    vscode.window.showInformationMessage('✅ API key saved securely');
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to save API key';
                    vscode.window.showErrorMessage(`❌ ${message}`);
                }
            }),

            vscode.commands.registerCommand('deepseek-copilot.clearApiKey', async () => {
                try {
                    await AuthService.clearApiKey();
                    vscode.window.showInformationMessage('API key cleared');
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to clear API key';
                    vscode.window.showErrorMessage(`❌ ${message}`);
                }
            })
        );

        // Register providers
        registerCompletionProvider(context);
        registerExplainCommand(context);
        
        // Only register inline completions if enabled in settings
        const config = vscode.workspace.getConfiguration('deepseekCopilot');
        if (config.get<boolean>('enableInline', true)) {
            registerInlineCompletionProvider(context);
        }

        vscode.window.showInformationMessage('DeepSeek Copilot activated successfully!');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to activate extension';
        vscode.window.showErrorMessage(`❌ DeepSeek Copilot failed to activate: ${message}`);
    }
}

export function deactivate() {
   
}