import * as vscode from 'vscode';
import { getCodeSuggestion } from '../api/deepseek';

export function registerCompletionProvider(context: vscode.ExtensionContext) {
    // Implement your completion provider logic here
    // Example:
    const provider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'typescript'],
        {
            async provideCompletionItems(document, position) {
                const text = document.getText();
                const suggestion = await getCodeSuggestion(text, context);
                return [new vscode.CompletionItem(suggestion)];
            }
        }
    );
    context.subscriptions.push(provider);
}