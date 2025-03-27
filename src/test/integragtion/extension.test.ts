import { describe, expect, it, beforeAll } from 'vitest';
import * as vscode from 'vscode-test';
import * as path from 'path';

describe('Extension Tests', () => {
  let extensionContext: vscode.ExtensionContext;

  beforeAll(async () => {
    extensionContext = await vscode.setupTestEnvironment({
      extensionPath: path.resolve(__dirname, '../../'),
      launchArgs: ['--disable-extensions']
    });
  });

  it('should activate', async () => {
    const extension = vscode.extensions.getExtension('Exodus_Tola.deepseek-copilot');
    await extension?.activate();
    expect(extension?.isActive).toBeTruthy();
  });

  it('should register commands', async () => {
    const commands = await vscode.commands.getCommands();
    expect(commands).toContain('deepseek-copilot.explainCode');
    expect(commands).toContain('deepseek-copilot.suggestCode');
  });
});