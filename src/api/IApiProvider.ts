export interface Suggestion {
    text: string;
    detail?: string;
    documentation?: string;
}

export interface IApiProvider {
    getCodeSuggestion(prompt: string, targetLanguage?: string): Promise<Suggestion[]>;
    validateApiKey(apiKey: string): boolean;
}
