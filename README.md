# DeepSeek Copilot 🤖💻

[![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Exodus_Tola.deepseek-copilot?color=blue&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=Exodus_Tola.deepseek-copilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot/pulls)

An AI-powered VS Code extension that provides intelligent code completions and explanations using the DeepSeek API (a GitHub Copilot alternative).

![Demo GIF](https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot/raw/main/images/demo.gif)  
*(Replace with your actual demo GIF)*

## Features ✨
- **AI Code Completions**: Context-aware suggestions for multiple languages
- **Code Explanations**: Understand complex code via `Ctrl+Alt+E` (Windows) / `Cmd+Alt+E` (Mac)
- **Secure API Key Management**: Encrypted storage using VS Code's secret API
- **Configurable**: Set max tokens, enable/disable inline suggestions
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, and more

## Installation 🛠️
### Via VS Code Marketplace
1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search for **"DeepSeek Copilot"**
3. Click **Install**

### Manual Installation
```bash
git clone https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot.git
cd DeepSeek-Copilot
npm install
code .

Build & Run
Command	| Action
pnpm run compile |	Production build
pnpm run watch |	Development mode (live reload)
pnpm run package |	Create VSIX for local testing
F5 in VS Code	|Launch debug session

Configuration ⚙️
Set your DeepSeek API key:

Open Command Palette (Ctrl+Shift+P)
Run: DeepSeek Copilot: Set API Key
Enter your API key from platform.deepseek.com

Settings (in settings.json):
{
  "deepseekCopilot.apiKey": "sk-your-key-here",
  "deepseekCopilot.maxTokens": 150,
  "deepseekCopilot.enableInline": true
}

Development 🧑‍💻
Prerequisites
Node.js ≥ 16

VS Code ≥ 1.75

DeepSeek API key

#Setup
git clone https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot.git
cd deepSeek-Copilot
pnpm install

Project Structure 📂

DeepSeek-Copilot/
├── src/
│   ├── api/            # DeepSeek API interactions
│   ├── providers/      # VS Code language features
│   └── extension.ts    # Extension entry point
├── test/               # Unit tests
├── package.json        # Extension manifest
└── README.md           # You are here :)


How to Contribute 🤝
We welcome contributions! Here's how:
1.Fork the repository
2. Create a branch (git checkout -b feature/your-feature)
3. Commit changes (git commit -m 'Add amazing feature')
4.Push to branch (git push origin feature/your-feature)
5.Open a Pull Request

License 📜
MIT © Exodus_Tola