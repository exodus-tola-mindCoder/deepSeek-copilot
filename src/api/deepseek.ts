import axios, { AxiosError } from 'axios';
import { AuthService } from './auth';
import * as vscode from 'vscode';

interface DeepSeekResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface Suggestion {
    text: string;
    detail?: string;
    documentation?: string;
}

const API_URL = 'https://api.deepseek.com/v1';
let lastRequestTime = 0;

export async function getCodeSuggestion(
    prompt: string
): Promise<Suggestion[]> {
    try {
        // Rate limiting
        const config = vscode.workspace.getConfiguration('deepseekCopilot');
        const rateLimitDelay = config.get<number>('rateLimitDelay', 1000); // Default to 1000ms

        const now = Date.now();
        const delay = Math.max(0, rateLimitDelay - (now - lastRequestTime));
        await new Promise(resolve => setTimeout(resolve, delay));
        lastRequestTime = Date.now();

        const apiKey = await AuthService.getApiKey();
        if (!apiKey) {
            // AuthService.getApiKey() should ideally handle prompting or throwing if it can't get a key.
            // If it returns undefined/null, it means the user cancelled or it failed after retries.
            throw new Error('API key is not available. Please set your DeepSeek API key.');
        }
        
        const maxTokens = config.get<number>('maxTokens', 100);
        const apiTimeout = config.get<number>('timeout', 15000);
        const model = config.get<string>('model', 'deepseek-chat'); // Add 'model' to package.json config
        const temperature = config.get<number>('temperature', 0.7); // Add 'temperature' to package.json config

        const response = await axios.post(
            `${API_URL}/chat/completions`,
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
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: apiTimeout
            }
        );

        if (!response.data?.choices?.length) {
            throw new Error('No suggestions returned from API');
        }

        return response.data.choices.map((choice: { message?: { content?: string } }) => ({
            text: choice.message?.content?.trim() || "",
            detail: "AI-generated suggestion",
        }));
    } catch (error) {
        const axiosError = error as AxiosError;
        // Log the raw API response for debugging if available
        if (axiosError.response?.data) {
            console.error("DeepSeek API Error Response:", axiosError.response.data);
        } else {
            console.error("DeepSeek API Error:", error);
        }

        if (axiosError.response?.status === 401) { // Unauthorized
            throw new Error('API key is invalid or unauthorized. Please check your API key and account status on platform.deepseek.com.');
        }
        if (axiosError.response?.status === 402) { // Payment Required
            throw new Error('Payment Required. Please check your DeepSeek account billing status or API plan at platform.deepseek.com.');
        }
        if (axiosError.response?.status === 422) {
            throw new Error("Invalid request format. This might be an issue with the extension or the API. Please check for updates or report the issue.");
        }
        if (axiosError.response?.status === 429) { // Too Many Requests
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        }
        // For other errors, rethrow a generic message or the original Axios error message
        throw new Error(`API request failed: ${axiosError.message || String(error)}`);
    }
}