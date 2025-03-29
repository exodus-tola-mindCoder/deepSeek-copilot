# DeepSeek Copilot 🤖✨

[![VS Code Version](https://img.shields.io/badge/VS%20Code-%3E%3D1.85-blue?logo=visual-studio-code)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

An AI-powered VS Code extension that provides intelligent code completions and explanations using the [DeepSeek API](https://platform.deepseek.com).


## 🚀 Features

- **Smart Code Completion**: Context-aware suggestions for 10+ languages
- **Code Explanation**: Highlight code → `Ctrl+Alt+E`/`Cmd+Alt+E` for instant analysis
- **Secure API Integration**: Encrypted key storage via VS Code's Secret API
- **Customizable**: Adjust token limits, suggestion delay, and more
- **Multi-Language Support**: JavaScript, Python, Java, C++, Rust, Go, and more

## 📦 Installation

### For Users
[![Install Now](https://img.shields.io/badge/-Install%20from%20Marketplace-007ACC?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=exodus-tola.deepseek-copilot)

1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search for **"DeepSeek Copilot"**
3. Click **Install**

### For Developers
```bash
git clone https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot.git
cd DeepSeek-Copilot
pnpm install
pnpm run package
code --install-extension *.vsix

⚙️ Configuration
1.Get API Key:
 - Visit DeepSeek Platform
 - Create account and get your API 
 
2. Set API Key in VS Code:
{
  "deepseekCopilot.apiKey": "sk-your-key-here",
  "deepseekCopilot.maxTokens": 150,
  "deepseekCopilot.enableInline": true,
  "deepseekCopilot.suggestionDelay": 300
}

Or use the Command Palette (Ctrl+Shift+P):
Run DeepSeek Copilot: Set API Key

🛠️ Development
Prerequisites
- Node.js ≥ 18
- VS Code ≥ 1.85
- DeepSeek API Key

Commands
Command	| Description
pnpm run compile	| Production build
pnpm run watch	  |Dev mode with live reload
pnpm run package	|Generate .vsix file
pnpm test         |	Run unit tests

Project Structure

deepseek-copilot/
├── src/
│   ├── api/            # DeepSeek API client
│   ├── providers/      # Language providers
│   └── extension.ts    # Main entry point
├── test/               # Vitest unit tests
└── package.json        # Extension manifest

❓ FAQ

Q: Why am I getting "402 Payment Required"?
A: Your DeepSeek account needs credits. Check your balance at platform.deepseek.com.

Q: How do I disable inline suggestions?

"deepseekCopilot.enableInline": false

Q: Do I need to build manually?
No! End users should install from the Marketplace. Manual builds are only for contributors.

🤝 Contributing
1. Fork the repository
2. Create a feature branch (git checkout -b feature/your-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/your-feature)
5. Open a Pull Request


📜 License
© MIT  Exodus_Tola