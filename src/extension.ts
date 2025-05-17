import * as vscode from 'vscode';
import { AuthService } from './api/auth';
import { registerCompletionProvider } from './providers/completion';
import { registerInlineCompletionProvider } from './providers/inline';
import { getCodeSuggestion } from './api/deepseek';
import { getWebviewContent } from './utils/webview';
import { generateExplanation } from './api/explanation';

let disposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext) {
    console.log('DeepSeek Copilot activating...');

    try {
        // Initialize auth service first
        await AuthService.init(context);

        // Helper function to prompt for API key if not set
        const ensureApiKeyOrPrompt = async (): Promise<string | undefined> => {
            const apiKey = await AuthService.getApiKey();
            if (!apiKey) {
                await promptAndSetApiKey();
                return await AuthService.getApiKey(); // Re-fetch after attempting to set
            }
            return apiKey;
        };

        // Register status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = "$(key) DeepSeek Copilot";
        statusBarItem.tooltip = "Click to set API key";
        statusBarItem.command = 'deepseek-copilot.setApiKey';
        context.subscriptions.push(statusBarItem);
        statusBarItem.show();

        const promptAndSetApiKey = async () => {
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
        };

        // Register all commands first
        const commands = [
            {
                command: 'deepseek-copilot.setApiKey',
                callback: promptAndSetApiKey
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
                        statusBarItem.text = "$(key) DeepSeek Copilot"; // Explicitly reset status bar
                        statusBarItem.tooltip = "Click to set API key";
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

                    const apiKey = await ensureApiKeyOrPrompt();
                    if (!apiKey) {
                        return;
                    }

                    try {
                        await vscode.window.showInformationMessage('Generating explanation...');
                        const explanation = await generateExplanation(selectedCode);

                        const panel = vscode.window.createWebviewPanel(
                            'codeExplanation',
                            'Code Explanation',
                            vscode.ViewColumn.Two,
                            {
                                enableScripts: true, // Enable scripts for Prism.js
                                retainContextWhenHidden: true
                            }
                        );

                        const languageId = editor?.document?.languageId || 'clike';
                        panel.webview.html = getWebviewContent(selectedCode, explanation, languageId);
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

                        const apiKey = await ensureApiKeyOrPrompt();
                        if (!apiKey) {
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
                        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
                            progress.report({ message: "Generating code suggestions..." });
                            return await getCodeSuggestion(text);
                        });

                        if (suggestions && suggestions.length > 0) {
                            const suggestion = suggestions[0];
                            if (suggestion.text) {
                                await editor.edit((editBuilder: vscode.TextEditorEdit) => {
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

        console.log('DeepSeek Copilot activated successfully');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to activate extension';
        await vscode.window.showErrorMessage(`❌ DeepSeek Copilot failed to activate: ${message}`);
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
                // After attempting to set, re-check and register providers if successful
                if (await AuthService.getApiKey()) {
                    statusBarItem.text = "$(check) DeepSeek Copilot";
                    statusBarItem.tooltip = "API key configured";
                    await registerProviders(context);
                }
            }
        } else {
            statusBarItem.text = "$(check) DeepSeek Copilot";
            statusBarItem.tooltip = "API key configured";
            await registerProviders(context);
        }
    } catch (error) {
        console.error('API key verification error:', error);
        // Ensure status bar reflects the need for an API key
        statusBarItem.text = "$(key) DeepSeek Copilot";
        statusBarItem.tooltip = "Click to set API key";
        // Optionally, you could re-prompt here or just let the user click the status bar
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

        const newDisposables: vscode.Disposable[] = [];

        newDisposables.push(registerCompletionProvider(context));
        
        // Only register inline completions if enabled in settings
        const config = vscode.workspace.getConfiguration('deepseekCopilot');
        if (config.get<boolean>('enableInline', true)) {
            newDisposables.push(registerInlineCompletionProvider(context));
        }

        // Add new disposables to the global list and context.subscriptions
        // context.subscriptions will handle their disposal on extension deactivation
        newDisposables.forEach(d => {
            disposables.push(d); // Keep track for manual disposal if needed (e.g., API key clear)
            context.subscriptions.push(d); // Ensure VS Code cleans them up
        });

        vscode.window.showInformationMessage('✅ DeepSeek Copilot activated successfully!');
    } catch (error) {
        console.error('Failed to register providers:', error);
        vscode.window.showErrorMessage('❌ DeepSeek Copilot: Failed to register providers');
    }
}

export function deactivate() {
    disposeProviders();
}