import * as vscode from 'vscode';
import { AuthService } from './api/auth';
import { registerCompletionProvider } from './providers/completion';
import { registerExplainCommand } from './providers/explain';
import { registerInlineCompletionProvider } from './providers/inline';
import { getCodeSuggestion } from './api/deepseek';
import { getWebviewContent } from './utils/webview';
import { generateExplanation } from './api/explanation';

let isActivated = false;
let disposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext) {
    console.log('DeepSeek Copilot activating...');

    try {
        // Initialize auth service first
        await AuthService.init(context);

        // Register status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = "$(key) DeepSeek Copilot";
        statusBarItem.tooltip = "Click to set API key";
        statusBarItem.command = 'deepseek-copilot.setApiKey';
        context.subscriptions.push(statusBarItem);
        statusBarItem.show();

        // Register all commands first
        const commands = [
            {
                command: 'deepseek-copilot.setApiKey',
                callback: async () => {
                    try {
                        const newKey = await AuthService.promptForApiKey();
                        if (newKey) {
                            await vscode.window.showInformationMessage('✅ DeepSeek Copilot: API key saved securely');
                            statusBarItem.text = "$(check) DeepSeek Copilot";
                            statusBarItem.tooltip = "API key configured";
                            // Refresh providers after API key is set
                            await registerProviders(context);
                        }
                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Failed to save API key';
                        await vscode.window.showErrorMessage(`❌ DeepSeek Copilot: ${message}`);
                        console.error('Set API key error:', error);
                        statusBarItem.text = "$(key) DeepSeek Copilot";
                        statusBarItem.tooltip = "Click to set API key";
                    }
                }
            },
            {
                command: 'deepseek-copilot.clearApiKey',
                callback: async () => {
                    try {
                        await AuthService.clearApiKey();
                        await vscode.window.showInformationMessage('✅ DeepSeek Copilot: API key cleared successfully');
                        statusBarItem.text = "$(key) DeepSeek Copilot";
                        statusBarItem.tooltip = "Click to set API key";
                        // Dispose existing providers
                        disposeProviders();
                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Failed to clear API key';
                        await vscode.window.showErrorMessage(`❌ DeepSeek Copilot: ${message}`);
                        console.error('Clear API key error:', error);
                    }
                }
            },
            {
                command: 'deepseek-copilot.explainCode',
                callback: async () => {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        await vscode.window.showErrorMessage('No active editor found');
                        return;
                    }

                    const selection = editor.selection;
                    if (selection.isEmpty) {
                        await vscode.window.showErrorMessage('Please select some code to explain');
                        return;
                    }

                    const selectedCode = editor.document.getText(selection);
                    if (!selectedCode) {
                        await vscode.window.showErrorMessage('No code selected');
                        return;
                    }

                    const apiKey = await AuthService.getApiKey();
                    if (!apiKey) {
                        await vscode.window.showErrorMessage('API key not found. Please set your API key first.');
                        return;
                    }

                    try {
                        await vscode.window.showInformationMessage('Generating explanation...');
                        const explanation = await generateExplanation(selectedCode, apiKey);

                        const panel = vscode.window.createWebviewPanel(
                            'codeExplanation',
                            'Code Explanation',
                            vscode.ViewColumn.Two,
                            {
                                enableScripts: false,
                                retainContextWhenHidden: true
                            }
                        );

                        panel.webview.html = getWebviewContent(selectedCode, explanation);
                        await vscode.window.showInformationMessage('Explanation generated successfully!');
                    } catch (error) {
                        await vscode.window.showErrorMessage(`Failed to generate explanation: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            },
            {
                command: 'deepseek-copilot.suggestCode',
                callback: async () => {
                    try {
                        const editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            await vscode.window.showWarningMessage('DeepSeek Copilot: No active editor');
                            return;
                        }

                        // Ensure API key is available
                        const apiKey = await AuthService.getApiKey();
                        if (!apiKey) {
                            const selection = await vscode.window.showInformationMessage(
                                'DeepSeek Copilot: Please set your API key first',
                                'Set API Key'
                            );
                            if (selection === 'Set API Key') {
                                await vscode.commands.executeCommand('deepseek-copilot.setApiKey');
                            }
                            return;
                        }

                        const selection = editor.selection;
                        const text = selection.isEmpty ? 
                            editor.document.getText() : 
                            editor.document.getText(selection);

                        const suggestions = await vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "DeepSeek Copilot",
                            cancellable: false
                        }, async (progress) => {
                            progress.report({ message: "Generating code suggestions..." });
                            return await getCodeSuggestion(text, context);
                        });

                        if (suggestions && suggestions.length > 0) {
                            const suggestion = suggestions[0];
                            if (suggestion.text) {
                                await editor.edit(editBuilder => {
                                    if (selection.isEmpty) {
                                        editBuilder.insert(editor.selection.active, suggestion.text);
                                    } else {
                                        editBuilder.replace(selection, suggestion.text);
                                    }
                                });
                                await vscode.window.showInformationMessage('✅ DeepSeek Copilot: Code suggestion applied');
                            }
                        } else {
                            await vscode.window.showInformationMessage('ℹ️ DeepSeek Copilot: No suggestions available');
                        }
                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Failed to generate suggestion';
                        await vscode.window.showErrorMessage(`❌ DeepSeek Copilot: ${message}`);
                        console.error('Suggest code error:', error);
                    }
                }
            }
        ];

        // Register all commands
        commands.forEach(({ command, callback }) => {
            const disposable = vscode.commands.registerCommand(command, callback);
            context.subscriptions.push(disposable);
            console.log(`Registered command: ${command}`);
        });

        // Verify API key and register providers
        await initializeWithApiKey(context, statusBarItem);

        isActivated = true;
        console.log('DeepSeek Copilot activated successfully');
    } catch (error: unknown) {
        isActivated = false;
        const message = error instanceof Error ? error.message : 'Failed to activate extension';
        await vscode.window.showErrorMessage(`❌ DeepSeek Copilot failed to activate: ${message}`);
        console.error('Activation error:', error);
        throw error; // Rethrow to notify VS Code of activation failure
    }
}

async function initializeWithApiKey(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    try {
        const apiKey = await AuthService.getApiKey();
        if (!apiKey) {
            statusBarItem.text = "$(key) DeepSeek Copilot";
            statusBarItem.tooltip = "Click to set API key";
            
            const selection = await vscode.window.showInformationMessage(
                'DeepSeek Copilot: Please set your API key to get started',
                'Set API Key'
            );
            
            if (selection === 'Set API Key') {
                await vscode.commands.executeCommand('deepseek-copilot.setApiKey');
            }
        } else {
            statusBarItem.text = "$(check) DeepSeek Copilot";
            statusBarItem.tooltip = "API key configured";
            await registerProviders(context);
        }
    } catch (error) {
        console.error('API key verification error:', error);
        statusBarItem.text = "$(key) DeepSeek Copilot";
        statusBarItem.tooltip = "Click to set API key";
        
        const selection = await vscode.window.showInformationMessage(
            'DeepSeek Copilot: Please set your API key to get started',
            'Set API Key'
        );
        
        if (selection === 'Set API Key') {
            await vscode.commands.executeCommand('deepseek-copilot.setApiKey');
        }
    }
}

function disposeProviders() {
    disposables.forEach(d => d.dispose());
    disposables = [];
}

async function registerProviders(context: vscode.ExtensionContext) {
    try {
        // Dispose existing providers first
        disposeProviders();

        // Register providers and store disposables
        disposables = [
            registerCompletionProvider(context)
        ];
        
        // Only register inline completions if enabled in settings
        const config = vscode.workspace.getConfiguration('deepseekCopilot');
        if (config.get<boolean>('enableInline', true)) {
            disposables.push(registerInlineCompletionProvider(context));
        }

        // Add all disposables to context subscriptions
        disposables.forEach(d => context.subscriptions.push(d));

        vscode.window.showInformationMessage('✅ DeepSeek Copilot activated successfully!');
    } catch (error) {
        console.error('Failed to register providers:', error);
        vscode.window.showErrorMessage('❌ DeepSeek Copilot: Failed to register providers');
        throw error;
    }
}

export function deactivate() {
    isActivated = false;
    disposeProviders();
}