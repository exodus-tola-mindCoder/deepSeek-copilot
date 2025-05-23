import * as vscode from 'vscode';
import { getCodeSuggestion } from '../api/deepseek';

export function registerInlineCompletionProvider(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = vscode.languages.registerInlineCompletionItemProvider(
        [{ scheme: 'file' }, { scheme: 'untitled' }],
        {
            async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                try {
                    const config = vscode.workspace.getConfiguration('deepseekCopilot');
                    const contextLines = config.get<number>('contextLines', 10);

                    const range = new vscode.Range(
                        new vscode.Position(Math.max(0, position.line - contextLines), 0),
                        position
                    );
                    const prefix = document.getText(range);

                    // Show progress indicator
                    const suggestions = await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "DeepSeek Copilot",
                        cancellable: false
                    }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
                        progress.report({ message: "Generating inline suggestions..." });
                        return await getCodeSuggestion(prefix);
                    });

                    return suggestions.map((suggestion: { text: string }) => ({
                        insertText: suggestion.text,
                        range: new vscode.Range(position, position)
                    }));
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage(`DeepSeek Copilot: ${error.message}`);
                    }
                    console.error('Inline completion error:', error);
                    return [];
                }
            }
        }
    );

    context.subscriptions.push(provider);
    return provider;
}