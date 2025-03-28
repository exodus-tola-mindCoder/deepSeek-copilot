import * as vscode from 'vscode';
import { getCodeSuggestion } from '../api/deepseek';

export function registerInlineCompletionProvider(context: vscode.ExtensionContext): void {
    const provider = vscode.languages.registerInlineCompletionItemProvider(
        [{ scheme: 'file' }, { scheme: 'untitled' }],
        {
            async provideInlineCompletionItems(document, position) {
                try {
                    const range = new vscode.Range(
                        new vscode.Position(Math.max(0, position.line - 10), 0),
                        position
                    );
                    const prefix = document.getText(range);

                    const suggestions = await getCodeSuggestion(prefix, context);

                    return suggestions.map(suggestion => ({
                        insertText: suggestion.text,
                        range: new vscode.Range(position, position)
                    }));
                } catch (error) {
                    console.error('Inline completion error:', error);
                    return [];
                }
            }
        }
    );

    context.subscriptions.push(provider);
}