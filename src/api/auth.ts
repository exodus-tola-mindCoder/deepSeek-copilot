import * as vscode from 'vscode';

export class AuthService {
    private static context: vscode.ExtensionContext;

    public static init(context: vscode.ExtensionContext): void {
        this.context = context;
    }

    public static async getApiKey(): Promise<string> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }

        // Check VS Code secrets
        const key = await this.context.secrets.get('deepseekApiKey');
        if (key) return key;

        // Not found - prompt user
        return this.promptForApiKey();
    }

    public static async promptForApiKey(): Promise<string> {
        const key = await vscode.window.showInputBox({
            title: 'DeepSeek API Key',
            prompt: 'Enter your API key from platform.deepseek.com',
            password: true,
            ignoreFocusOut: true,
            validateInput: value => {
                if (!value) return 'API key cannot be empty';
                if (!value.startsWith('sk-')) return 'API key should start with "sk-"';
                return null;
            }
        });

        if (!key) {
            throw new Error('API key entry cancelled');
        }

        // Store securely
        await this.context.secrets.store('deepseekApiKey', key);
        return key;
    }

    public static async clearApiKey(): Promise<void> {
        if (!this.context) {
            throw new Error('AuthService not initialized');
        }
        await this.context.secrets.delete('deepseekApiKey');
    }
}