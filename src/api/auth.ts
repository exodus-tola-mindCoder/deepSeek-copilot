import * as vscode from 'vscode';

export class AuthService {
    private static context: vscode.ExtensionContext;
    private static readonly API_KEY_SECRET = 'deepseekApiKey';
    private static readonly MAX_RETRIES = 3;
    private static retryCount = 0;

    public static init(context: vscode.ExtensionContext): void {
        this.context = context;
        this.retryCount = 0;
    }

    public static async getApiKey(): Promise<string> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }

        try {
            // Check VS Code secrets
            const key = await this.context.secrets.get(this.API_KEY_SECRET);
            if (key) {
                // Validate the stored key
                if (this.validateApiKey(key)) {
                    this.retryCount = 0; // Reset retry count on success
                    return key;
                } else {
                    console.warn('Stored API key is invalid, clearing and requesting new one');
                    await this.clearApiKey();
                    return this.promptForApiKey();
                }
            }
            // Not found - prompt user
            return this.promptForApiKey();
        } catch (error) {
            console.error('Error getting API key:', error);
            
            // Implement retry logic
            if (this.retryCount < this.MAX_RETRIES) {
                this.retryCount++;
                console.log(`Retrying API key retrieval (attempt ${this.retryCount}/${this.MAX_RETRIES})`);
                return this.getApiKey();
            }
            
            throw new Error('Failed to retrieve API key after multiple attempts. Please try setting it again.');
        }
    }

    public static async promptForApiKey(): Promise<string> {
        try {
            const key = await vscode.window.showInputBox({
                title: 'DeepSeek API Key',
                prompt: 'Enter your API key from platform.deepseek.com',
                password: true,
                ignoreFocusOut: true,
                validateInput: this.validateApiKeyInput.bind(this)
            });

            if (!key) {
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

            this.retryCount = 0; // Reset retry count on successful save
            return key;
        } catch (error) {
            console.error('Error prompting for API key:', error);
            throw error;
        }
    }

    public static async clearApiKey(): Promise<void> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }
        try {
            await this.context.secrets.delete(this.API_KEY_SECRET);
            this.retryCount = 0; // Reset retry count on successful clear
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
        if (!/^[a-zA-Z0-9_-]+$/.test(value.substring(3))) {
            return 'API key contains invalid characters';
        }
        return null;
    }

    private static validateApiKey(key: string): boolean {
        try {
            return (
                key.startsWith('sk-') &&
                key.length >= 32 &&
                /^[a-zA-Z0-9_-]+$/.test(key.substring(3))
            );
        } catch (error) {
            console.error('Error validating API key:', error);
            return false;
        }
    }
}