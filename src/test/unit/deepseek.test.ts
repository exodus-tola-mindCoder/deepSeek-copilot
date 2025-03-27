import { describe, expect, it, vi } from 'vitest';
import { getCodeSuggestion } from '../../src/api/deepseek';
import * as vscode from 'vscode';

// Mock VS Code extension context
const mockContext = {
  secrets: {
    get: vi.fn(() => Promise.resolve('test-api-key')),
    store: vi.fn(),
    delete: vi.fn()
  }
} as unknown as vscode.ExtensionContext;

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({
      data: { choices: [{ text: "// Mock suggestion" }] }
    }))
  }
}));

describe('DeepSeek API', () => {
  it('should return code suggestions', async () => {
    const suggestion = await getCodeSuggestion("function test()", mockContext);
    expect(suggestion).toBe("// Mock suggestion");
  });

  it('should handle API errors', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("API Error"));
    await expect(getCodeSuggestion("function test()", mockContext))
      .rejects.toThrow("API Error");
  });
});