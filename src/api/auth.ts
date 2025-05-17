import * as vscode from 'vscode';

export class AuthService {
    private static context: vscode.ExtensionContext;
    private static readonly API_KEY_SECRET = 'deepseekApiKey';
    private static readonly MAX_RETRIES = 3;

    public static init(context: vscode.ExtensionContext): void {
        this.context = context;
    }

    public static async getApiKey(): Promise<string> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }

        let attempts = 0;
        const maxAttempts = this.MAX_RETRIES + 1; // Total attempts including the first one

        while (attempts < maxAttempts) {
            try {
                const key = await this.context.secrets.get(this.API_KEY_SECRET);
                if (key) {
                    if (this.validateApiKey(key)) {
                        return key; // Valid key found
                    } else {
                        console.warn('Stored API key is invalid. Clearing and prompting for a new one.');
                        await this.clearApiKeyInternal(); // Clear the invalid key silently
                        // Proceed to prompt for a new key in this attempt cycle
                        return await this.promptForApiKey();
                    }
                } else {
                    // No key found in secrets, prompt the user
                    return await this.promptForApiKey();
                }
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts}/${maxAttempts} to get API key failed:`, error);
                if (attempts >= maxAttempts) {
                    throw new Error('Failed to retrieve API key after multiple attempts. Please try setting it again.');
                }
                // Optional: Add a small delay before retrying the entire getApiKey operation
                // await new Promise(resolve => setTimeout(resolve, 200 * attempts));
            }
        }
        // This line should be unreachable if maxAttempts > 0 and logic is correct
        throw new Error('Exhausted attempts to retrieve API key.');
    }

    public static async promptForApiKey(): Promise<string> {
        if (!this.context) {
            throw new Error('AuthService not initialized. Cannot prompt for API key.');
        }
        try {
            const key = await vscode.window.showInputBox({
                title: 'DeepSeek API Key',
                prompt: 'Enter your API key from platform.deepseek.com',
                password: true,
                ignoreFocusOut: true,
                validateInput: this.validateApiKeyInput // No need to bind `this` for a static method
            });

            if (!key) {
                // User cancelled the input box
                throw new Error('API key entry cancelled');
            }

            if (!this.validateApiKey(key)) {
                throw new Error('Invalid API key format');
            }

            try {
                // Store securely
                await this.context.secrets.store(this.API_KEY_SECRET, key);
            } catch (storageError) {
                console.error('Error storing API key, retrying...', storageError);
                // If storage fails, try one more time
                await this.context.secrets.store(this.API_KEY_SECRET, key);
            }
            return key;
        } catch (error) {
            console.error('Error prompting for API key:', error);
            throw error;
        }
    }

    // Internal helper for clearing API key without throwing on final failure, used by getApiKey
    private static async clearApiKeyInternal(): Promise<void> {
        if (!this.context) {
            console.warn('AuthService not initialized during internal clear.');
            return;
        }
        try {
            await this.context.secrets.delete(this.API_KEY_SECRET);
        } catch (error) {
            console.error('Error during initial internal API key clear:', error);
            try {
                await this.context.secrets.delete(this.API_KEY_SECRET); // Retry once
            } catch (retryError) {
                console.error('Error during retry of internal API key clear:', retryError);

            }
        }
    }

    public static async clearApiKey(): Promise<void> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }
        try {
            await this.context.secrets.delete(this.API_KEY_SECRET);
        } catch (error) {
            console.error('Error clearing API key:', error);
            // Try one more time
            try {
                await this.context.secrets.delete(this.API_KEY_SECRET);
            } catch (retryError) {
                throw new Error('Failed to clear API key after retry');
            }
        }
    }

    private static validateApiKeyInput(value: string): string | null {
        if (!value) {
            return 'API key cannot be empty';
        }
        if (!value.startsWith('sk-')) {
            return 'API key should start with "sk-"';
        }
        if (value.length < 32) {
            return 'API key should be at least 32 characters long';
        }
        // The part after 'sk-' should consist of alphanumeric characters, underscores, or hyphens.
        if (!/^[a-zA-Z0-9_-]+$/.test(value.substring(3))) { 
            return 'API key contains invalid characters';
        }
        return null;
    }

    private static validateApiKey(key: string): boolean {
        return !!key && // Ensure key is not null or empty before other checks
               key.startsWith('sk-') &&
               key.length >= 32 &&
               /^[a-zA-Z0-9_-]+$/.test(key.substring(3));
    }
}