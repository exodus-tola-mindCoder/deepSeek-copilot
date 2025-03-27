import * as vscode from 'vscode';
import { getCodeSuggestion } from '../api/deepseek';

export function registerExplainCommand(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand(
        'deepseek-copilot.explainCode',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            
            const selectedText = editor.document.getText(editor.selection);
            const explanation = await getCodeSuggestion(
                `Explain this code:\n${selectedText}`,
                context
            );
            
            vscode.window.showInformationMessage(explanation);
        }
    );
    context.subscriptions.push(command);
}