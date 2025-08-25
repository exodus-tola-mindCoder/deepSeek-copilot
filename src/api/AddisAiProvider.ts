import axios, { AxiosError } from 'axios';
import * as vscode from 'vscode';
import { IApiProvider, Suggestion } from './IApiProvider';

export class AddisAiProvider implements IApiProvider {
    private static readonly API_URL = 'https://api.addisassistant.com/api/v1/chat_generate';
    private static lastRequestTime = 0;

    constructor(private apiKey: string) {}

    async getCodeSuggestion(prompt: string, targetLanguage?: string): Promise<Suggestion[]> {
        try {
            // Rate limiting
            const config = vscode.workspace.getConfiguration('deepseekCopilot');
            const rateLimitDelay = config.get<number>('rateLimitDelay', 1000);

            const now = Date.now();
            const delay = Math.max(0, rateLimitDelay - (now - AddisAiProvider.lastRequestTime));
            await new Promise(resolve => setTimeout(resolve, delay));
            AddisAiProvider.lastRequestTime = Date.now();

            const maxTokens = config.get<number>('maxTokens', 100);
            const apiTimeout = config.get<number>('timeout', 15000);
            const temperature = config.get<number>('temperature', 0.7);

            const response = await axios.post(
                AddisAiProvider.API_URL,
                {
                    prompt: prompt,
                    target_language: targetLanguage || 'en', // Default to English
                    generation_config: {
                        temperature: temperature,
                        max_tokens: maxTokens,
                        stream: false
                    }
                },
                {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    timeout: apiTimeout
                }
            );

            if (!response.data?.choices?.length) {
                throw new Error('No suggestions returned from ADDIS AI API');
            }

            return response.data.choices.map((choice: { message?: { content?: string } }) => ({
                text: choice.message?.content?.trim() || "",
                detail: "AI-generated suggestion (ADDIS AI)",
            }));

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.data) {
                console.error("ADDIS AI API Error Response:", axiosError.response.data);
            } else {
                console.error("ADDIS AI API Error:", error);
            }

            if (axiosError.response?.status === 401) {
                throw new Error('ADDIS AI API key is invalid or unauthorized. Please check your API key.');
            }
            if (axiosError.response?.status === 402) {
                throw new Error('Payment Required. Please check your ADDIS AI account billing status.');
            }
            if (axiosError.response?.status === 429) {
                throw new Error('ADDIS AI API rate limit exceeded. Please wait a moment and try again.');
            }

            throw new Error(`ADDIS AI API request failed: ${axiosError.message || String(error)}`);
        }
    }

    validateApiKey(apiKey: string): boolean {
        // ADDIS AI API keys typically start with 'sk_' and are longer
        return !!apiKey && 
               apiKey.startsWith('sk_') &&
               apiKey.length >= 64; // ADDIS AI keys are typically longer
    }
}
