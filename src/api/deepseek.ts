import axios, { AxiosError } from 'axios';
import * as vscode from 'vscode';
import { IApiProvider, Suggestion } from './IApiProvider';

export class DeepSeekProvider implements IApiProvider {
    private static readonly API_URL = 'https://api.deepseek.com/v1';
    private static lastRequestTime = 0;

    constructor(private apiKey: string) {}

    async getCodeSuggestion(prompt: string): Promise<Suggestion[]> {
        try {
            // Rate limiting
            const config = vscode.workspace.getConfiguration('deepseekCopilot');
            const rateLimitDelay = config.get<number>('rateLimitDelay', 1000);

            const now = Date.now();
            const delay = Math.max(0, rateLimitDelay - (now - DeepSeekProvider.lastRequestTime));
            await new Promise(resolve => setTimeout(resolve, delay));
            DeepSeekProvider.lastRequestTime = Date.now();

            const maxTokens = config.get<number>('maxTokens', 100);
            const apiTimeout = config.get<number>('timeout', 15000);
            const model = config.get<string>('model', 'deepseek-chat');
            const temperature = config.get<number>('temperature', 0.7);

            const response = await axios.post(
                `${DeepSeekProvider.API_URL}/chat/completions`,
                {
                    model: model,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
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
                throw new Error('No suggestions returned from DeepSeek API');
            }

            return response.data.choices.map((choice: { message?: { content?: string } }) => ({
                text: choice.message?.content?.trim() || "",
                detail: "AI-generated suggestion (DeepSeek)",
            }));

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.data) {
                console.error("DeepSeek API Error Response:", axiosError.response.data);
            } else {
                console.error("DeepSeek API Error:", error);
            }

            if (axiosError.response?.status === 401) {
                throw new Error('DeepSeek API key is invalid or unauthorized. Please check your API key and account status on platform.deepseek.com.');
            }
            if (axiosError.response?.status === 402) {
                throw new Error('Payment Required. Please check your DeepSeek account billing status or API plan at platform.deepseek.com.');
            }
            if (axiosError.response?.status === 422) {
                throw new Error("Invalid request format. This might be an issue with the extension or the API. Please check for updates or report the issue.");
            }
            if (axiosError.response?.status === 429) {
                throw new Error('DeepSeek API rate limit exceeded. Please wait a moment and try again.');
            }

            throw new Error(`DeepSeek API request failed: ${axiosError.message || String(error)}`);
        }
    }

    validateApiKey(apiKey: string): boolean {
        // DeepSeek API keys typically start with 'sk-' and are at least 32 characters
        return !!apiKey && 
               apiKey.startsWith('sk-') &&
               apiKey.length >= 32;
    }
}
