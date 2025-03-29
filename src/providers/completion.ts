import * as vscode from 'vscode';
import { getCodeSuggestion } from '../api/deepseek';

// Cache implementation
interface CacheEntry {
    data: vscode.CompletionItem[];
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedSuggestions(key: string): vscode.CompletionItem[] | undefined {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return undefined;
}

function setCachedSuggestions(key: string, suggestions: vscode.CompletionItem[]): void {
    cache.set(key, {
        data: suggestions,
        timestamp: Date.now()
    });
}

export function registerCompletionProvider(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = vscode.languages.registerCompletionItemProvider(
        [{ scheme: 'file' }, { scheme: 'untitled' }],
        {
            async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                try {
                    const config = vscode.workspace.getConfiguration('deepseekCopilot');
                    const contextLines = config.get<number>('contextLines', 10);
                    const timeout = config.get<number>('timeout', 15000);

                    const range = new vscode.Range(
                        new vscode.Position(Math.max(0, position.line - contextLines), 0),
                        position
                    );
                    const prefix = document.getText(range);

                    // Check cache first
                    const cached = getCachedSuggestions(prefix);
                    if (cached) {
                        return cached;
                    }

                    // Show progress indicator
                    const suggestions = await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "DeepSeek Copilot",
                        cancellable: false
                    }, async (progress) => {
                        progress.report({ message: "Generating code suggestions..." });
                        return await getCodeSuggestion(prefix, context);
                    });

                    const items = suggestions.map(suggestion => {
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

                    // Cache the results
                    setCachedSuggestions(prefix, items);
                    return items;
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage(`DeepSeek Copilot: ${error.message}`);
                    }
                    console.error('Completion error:', error);
                    return [];
                }
            }
        },
        ...['.', ' ', '\t', '\n', '(', '[', '{', '<', '"', "'"] // Trigger characters
    );

    context.subscriptions.push(provider);
    return provider;
}