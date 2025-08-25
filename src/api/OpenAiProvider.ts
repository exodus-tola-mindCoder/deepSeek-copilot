import axios, { AxiosError } from 'axios';
import * as vscode from 'vscode';
import { IApiProvider, Suggestion } from './IApiProvider';

export class OpenAiProvider implements IApiProvider {
    private static readonly API_URL = 'https://api.openai.com/v1/chat/completions';
    private static lastRequestTime = 0;

    constructor(private apiKey: string) {}

    async getCodeSuggestion(prompt: string): Promise<Suggestion[]> {
        try {
            // Rate limiting
            const config = vscode.workspace.getConfiguration('deepseekCopilot');
            const rateLimitDelay = config.get<number>('rateLimitDelay', 1000);

            const now = Date.now();
            const delay = Math.max(0, rateLimitDelay - (now - OpenAiProvider.lastRequestTime));
            await new Promise(resolve => setTimeout(resolve, delay));
            OpenAiProvider.lastRequestTime = Date.now();

            const maxTokens = config.get<number>('maxTokens', 100);
            const apiTimeout = config.get<number>('timeout', 15000);
            const temperature = config.get<number>('temperature', 0.7);

            const response = await axios.post(
                OpenAiProvider.API_URL,
                {
                    model: "gpt-3.5-turbo", // Specify the model
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: maxTokens,
                    temperature: temperature,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: apiTimeout
                }
            );

            if (!response.data?.choices?.length) {
                throw new Error('No suggestions returned from OpenAI API');
            }

            return response.data.choices.map((choice: { message?: { content?: string } }) => ({
                text: choice.message?.content?.trim() || "",
                detail: "AI-generated suggestion (OpenAI)",
            }));

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.data) {
                console.error("OpenAI API Error Response:", axiosError.response.data);
            } else {
                console.error("OpenAI API Error:", error);
            }

            if (axiosError.response?.status === 401) {
                throw new Error('OpenAI API key is invalid or unauthorized. Please check your API key.');
            }
            if (axiosError.response?.status === 429) {
                throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
            }

            throw new Error(`OpenAI API request failed: ${axiosError.message || String(error)}`);
        }
    }

    validateApiKey(apiKey: string): boolean {
        // OpenAI API keys typically start with 'sk-' and are longer
        return !!apiKey && 
               apiKey.startsWith('sk-') &&
               apiKey.length >= 32; // OpenAI keys are typically longer
    }
}
