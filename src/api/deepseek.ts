import axios from 'axios';
import { AuthService } from './auth';
import * as vscode from 'vscode';

const API_URL = 'https://api.deepseek.com/v1/completions';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

export async function getCodeSuggestion(
    prompt: string,
    context: vscode.ExtensionContext
): Promise<string> {
    try {
        // Rate limiting
        const now = Date.now();
        const delay = Math.max(0, RATE_LIMIT_DELAY - (now - lastRequestTime));
        await new Promise(resolve => setTimeout(resolve, delay));
        lastRequestTime = Date.now();

        // Get secure API key
        const apiKey = await AuthService.getApiKey();

        const response = await axios.post(API_URL, {
            prompt,
            max_tokens: vscode.workspace.getConfiguration('deepseekCopilot').get('maxTokens') || 100,
            temperature: 0.7
        }, {
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('DeepSeek API Error:', error);
        
        if (error.response?.status === 401) {
            await AuthService.clearApiKey();
            throw new Error('Invalid API key - please set a new one');
        }

        throw new Error(
            error.response?.data?.error?.message || 
            error.message || 
            'Failed to get AI suggestion'
        );
    }
}