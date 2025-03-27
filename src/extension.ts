import * as vscode from 'vscode';
import { AuthService } from './api/auth';
import { registerCompletionProvider } from './providers/completion';
import { registerExplainCommand } from './providers/explain';

export function activate(context: vscode.ExtensionContext) {
    // Initialize auth service
    AuthService.init(context);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('deepseek-copilot.setApiKey', async () => {
            try {
                await AuthService.clearApiKey();
                const newKey = await AuthService.promptForApiKey();
                vscode.window.showInformationMessage('✅ API key saved securely');
            } catch (error) {
                vscode.window.showErrorMessage(`❌ ${error.message}`);
            }
        }),

        vscode.commands.registerCommand('deepseek-copilot.clearApiKey', async () => {
            await AuthService.clearApiKey();
            vscode.window.showInformationMessage('API key cleared');
        })
    );

    // Register AI features
    registerCompletionProvider(context);
    registerExplainCommand(context);
}