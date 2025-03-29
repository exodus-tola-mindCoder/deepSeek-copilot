import * as vscode from 'vscode';
import { getCodeSuggestion } from './deepseek';

export async function generateExplanation(code: string, apiKey: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('deepseekCopilot');
    const maxTokens = config.get<number>('maxTokens', 100);
    const timeout = config.get<number>('timeout', 15000);

    const prompt = `Explain this code in detail:\n${code}\n\nExplanation:`;
    
    const result = await getCodeSuggestion(prompt, { apiKey, maxTokens, timeout });
    return result[0]?.text || 'No explanation generated';
} 