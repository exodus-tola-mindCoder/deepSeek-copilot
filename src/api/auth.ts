import * as vscode from 'vscode';
import { ApiProviderType, ProviderFactory } from './ProviderFactory';

export class AuthService {
    private static context: vscode.ExtensionContext;
    private static readonly MAX_RETRIES = 3;

    public static init(context: vscode.ExtensionContext): void {
        this.context = context;
    }

    public static async getApiKey(providerType: ApiProviderType = ProviderFactory.getDefaultProvider()): Promise<string> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }

        const secretName = ProviderFactory.getApiKeySecretName(providerType);
        let attempts = 0;
        const maxAttempts = this.MAX_RETRIES + 1;

        while (attempts < maxAttempts) {
            try {
                const key = await this.context.secrets.get(secretName);
                if (key) {
                    if (ProviderFactory.validateApiKey(key, providerType)) {
                        return key; // Valid key found
                    } else {
                        console.warn(`Stored ${ProviderFactory.getProviderDisplayName(providerType)} API key is invalid. Clearing and prompting for a new one.`);
                        await this.clearApiKeyInternal(providerType); // Clear the invalid key silently
                        // Proceed to prompt for a new key in this attempt cycle
                        return await this.promptForApiKey(providerType);
                    }
                } else {
                    // No key found in secrets, prompt the user
                    return await this.promptForApiKey(providerType);
                }
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts}/${maxAttempts} to get ${ProviderFactory.getProviderDisplayName(providerType)} API key failed:`, error);
                if (attempts >= maxAttempts) {
                    throw new Error(`Failed to retrieve ${ProviderFactory.getProviderDisplayName(providerType)} API key after multiple attempts. Please try setting it again.`);
                }
            }
        }
        throw new Error('Exhausted attempts to retrieve API key.');
    }

    public static async promptForApiKey(providerType: ApiProviderType = ProviderFactory.getDefaultProvider()): Promise<string> {
        if (!this.context) {
            throw new Error('AuthService not initialized. Cannot prompt for API key.');
        }
        try {
            const providerName = ProviderFactory.getProviderDisplayName(providerType);
            const key = await vscode.window.showInputBox({
                title: `${providerName} API Key`,
                prompt: `Enter your ${providerName} API key`,
                password: true,
                ignoreFocusOut: true,
                validateInput: (value) => this.validateApiKeyInput(value, providerType)
            });

            if (!key) {
                throw new Error('API key entry cancelled');
            }

            if (!ProviderFactory.validateApiKey(key, providerType)) {
                throw new Error(`Invalid ${providerName} API key format`);
            }

            try {
                const secretName = ProviderFactory.getApiKeySecretName(providerType);
                await this.context.secrets.store(secretName, key);
            } catch (storageError) {
                console.error('Error storing API key, retrying...', storageError);
                const secretName = ProviderFactory.getApiKeySecretName(providerType);
                await this.context.secrets.store(secretName, key);
            }
            return key;
        } catch (error) {
            console.error('Error prompting for API key:', error);
            throw error;
        }
    }

    // Internal helper for clearing API key without throwing on final failure
    private static async clearApiKeyInternal(providerType: ApiProviderType): Promise<void> {
        if (!this.context) {
            console.warn('AuthService not initialized during internal clear.');
            return;
        }
        try {
            const secretName = ProviderFactory.getApiKeySecretName(providerType);
            await this.context.secrets.delete(secretName);
        } catch (error) {
            console.error('Error during initial internal API key clear:', error);
            try {
                const secretName = ProviderFactory.getApiKeySecretName(providerType);
                await this.context.secrets.delete(secretName);
            } catch (retryError) {
                console.error('Error during retry of internal API key clear:', retryError);
            }
        }
    }

    public static async clearApiKey(providerType: ApiProviderType = ProviderFactory.getDefaultProvider()): Promise<void> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }
        try {
            const secretName = ProviderFactory.getApiKeySecretName(providerType);
            await this.context.secrets.delete(secretName);
        } catch (error) {
            console.error('Error clearing API key:', error);
            try {
                const secretName = ProviderFactory.getApiKeySecretName(providerType);
                await this.context.secrets.delete(secretName);
            } catch (retryError) {
                throw new Error('Failed to clear API key after retry');
            }
        }
    }

    private static validateApiKeyInput(value: string, providerType: ApiProviderType): string | null {
        if (!value) {
            return 'API key cannot be empty';
        }
        
        if (!ProviderFactory.validateApiKey(value, providerType)) {
            const providerName = ProviderFactory.getProviderDisplayName(providerType);
            return `Invalid ${providerName} API key format`;
        }
        
        return null;
    }
}
