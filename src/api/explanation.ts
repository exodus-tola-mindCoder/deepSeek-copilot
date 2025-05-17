import { getCodeSuggestion } from './deepseek';

export async function generateExplanation(code: string): Promise<string> {
    const prompt = `Explain this code in detail:\n${code}\n\nExplanation:`;
    
    const result = await getCodeSuggestion(prompt);
    return result[0]?.text || 'No explanation generated';
} 