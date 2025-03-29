import axios, { AxiosError } from 'axios';
import { AuthService } from './auth';
import * as vscode from 'vscode';

interface DeepSeekResponse {
    choices: Array<{
        text: string;
        detail?: string;
        documentation?: string;
    }>;
}

interface Suggestion {
    text: string;
    detail?: string;
    documentation?: string;
}

const API_URL = 'https://api.deepseek.com/v1/completions';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

export async function getCodeSuggestion(
    prompt: string,
    context: vscode.ExtensionContext
): Promise<Suggestion[]> {
    try {
        // Rate limiting
        const now = Date.now();
        const delay = Math.max(0, RATE_LIMIT_DELAY - (now - lastRequestTime));
        await new Promise(resolve => setTimeout(resolve, delay));
        lastRequestTime = Date.now();

        const apiKey = await AuthService.getApiKey();
        const config = vscode.workspace.getConfiguration('deepseekCopilot');
        const maxTokens = config.get<number>('maxTokens', 100);

        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: maxTokens,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
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
        console.error("API Error:", axiosError.response?.data);

        if (axiosError.response?.status === 422) {
            throw new Error("Invalid request format. Please update the extension.");
        }
        throw error;
    }
    return [];
}