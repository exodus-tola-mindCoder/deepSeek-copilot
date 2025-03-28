import * as vscode from 'vscode';
import { getCodeSuggestion } from '../api/deepseek';

export function registerCompletionProvider(context: vscode.ExtensionContext): void {
    const provider = vscode.languages.registerCompletionItemProvider(
        [{ scheme: 'file' }, { scheme: 'untitled' }], // Support all files
        {
            async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                try {
                    const range = new vscode.Range(
                        new vscode.Position(Math.max(0, position.line - 10), 0),
                        position
                    );
                    const prefix = document.getText(range);

                    const suggestions = await getCodeSuggestion(prefix, context);

                    return suggestions.map(suggestion => {
                        const item = new vscode.CompletionItem(
                            suggestion.text,
                            vscode.CompletionItemKind.Snippet
                        );
                        item.detail = suggestion.detail || 'DeepSeek Copilot Suggestion';
                        item.documentation = new vscode.MarkdownString(
                            suggestion.documentation || 'AI-generated code suggestion'
                        );
                        item.insertText = suggestion.text;
                        item.range = new vscode.Range(position, position);
                        return item;
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage(`DeepSeek Copilot: ${error.message}`);
                    }
                    return [];
                }
            }
        },
        ...['.', ' ', '\t', '\n', '(', '[', '{', '<', '"', "'"] // Trigger characters
    );

    context.subscriptions.push(provider);
}