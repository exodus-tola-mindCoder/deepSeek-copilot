import { ProviderFactory } from './ProviderFactory';
import { AuthService } from './auth';

export async function generateExplanation(code: string): Promise<string> {
    const prompt = `Explain this code in detail:\n${code}\n\nExplanation:`;
    
    try {
        const providerType = ProviderFactory.getDefaultProvider();
        const apiKey = await AuthService.getApiKey(providerType);
        if (!apiKey) {
            throw new Error('API key not available');
        }

        const provider = ProviderFactory.createProvider(apiKey, providerType);
        const result = await provider.getCodeSuggestion(prompt);
        return result[0]?.text || 'No explanation generated';
    } catch (error) {
        throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : String(error)}`);
    }
}
