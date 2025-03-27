import * as vscode from 'vscode';

// Key storage service
export class AuthService {
    private static instance: AuthService;
    private constructor(private context: vscode.ExtensionContext) {}

    public static init(context: vscode.ExtensionContext): void {
        AuthService.instance = new AuthService(context);
    }

    public static async getApiKey(): Promise<string> {
        if (!this.instance) {
            throw new Error('AuthService not initialized');
        }

        // 1. Check VS Code secrets
        const key = await this.instance.context.secrets.get('deepseekApiKey');
        if (key) return key;

        // 2. Not found - prompt user
        return this.promptForApiKey();
    }

    private static async promptForApiKey(): Promise<string> {
        const key = await vscode.window.showInputBox({
            title: 'DeepSeek API Key',
            prompt: 'Enter your API key from platform.deepseek.com',
            password: true,
            ignoreFocusOut: true,
            validateInput: value => {
                if (!value) return 'API key cannot be empty';
                if (!value.startsWith('sk-')) return 'Invalid key format';
                return null;
            }
        });

        if (!key) {
            throw new Error('API key is required');
        }

        // Store securely
        await this.instance.context.secrets.store('deepseekApiKey', key);
        return key;
    }

    public static async clearApiKey(): Promise<void> {
        await this.instance.context.secrets.delete('deepseekApiKey');
    }
}