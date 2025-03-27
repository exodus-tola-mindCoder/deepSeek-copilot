import * as assert from 'assert';
import * as vscode from 'vscode';
import { after, before } from 'mocha';
import { getApiKey, clearApiKey } from '../src/api/auth';

suite('Extension Test Suite', () => {
    let context: vscode.ExtensionContext;
    
    before(async () => {
        // Mock extension context
        context = {
            secrets: {
                store: async (key: string, value: string) => {},
                get: async (key: string) => 'test-api-key',
                delete: async (key: string) => {}
            },
            subscriptions: []
        } as unknown as vscode.ExtensionContext;
    });

    after(async () => {
        await clearApiKey(context);
    });

    test('API Key Storage', async () => {
        // Test key storage
        await context.secrets.store('deepseekApiKey', 'test-key-123');
        const key = await getApiKey(context);
        assert.strictEqual(key, 'test-key-123');
    });

    test('Command Registration', async () => {
        // Test if commands are registered
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('deepseek-copilot.setApiKey'));
        assert.ok(commands.includes('deepseek-copilot.explainCode'));
    });
});