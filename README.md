# DeepSeek Copilot 🤖💻  

[![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Exodus_Tola.deepseek-copilot?color=blue&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=Exodus_Tola.deepseek-copilot)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot/pulls)  

An AI-powered VS Code extension that provides **intelligent code completions** and **explanations** using the [DeepSeek API](https://platform.deepseek.com).  

![Demo GIF](https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot/raw/main/images/demo.gif)  

---

## 🚀 Features  
- **Smart Code Completions** - Context-aware suggestions for 10+ languages  
- **Explain Code** - Get detailed explanations via `Ctrl+Alt+E` (Win) / `Cmd+Alt+E` (Mac)  
- **Secure API Key Storage** - Encrypted using VS Code's [Secret API](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)  
- **Configurable** - Control token limits, inline suggestions, and more  
- **Multi-Language Support** - JavaScript, Python, Java, C++, Rust, and more  

---

## 🔧 Installation  
### **Via VS Code Marketplace**  
1. Open Extensions (`Ctrl+Shift+X`)  
2. Search for **"DeepSeek Copilot"**  
3. Click **Install**  

### **Manual Build**  
```bash
git clone https://github.com/exodus-tola-mindCoder/DeepSeek-Copilot.git
cd DeepSeek-Copilot
pnpm install && pnpm run package
code --install-extension *.vsix


⚙️ Configuration
1. Set Your API Key

   1. Get a free API key: platform.deepseek.com
   2. In VS Code:
     👉 Run Command Palette (Ctrl+Shift+P)
     👉 Select: DeepSeek Copilot: Set API Key


 2. Settings (settings.json);
 {
  "deepseekCopilot.apiKey": "sk-your-key-here",  // Required
  "deepseekCopilot.maxTokens": 150,              // Default: 100
  "deepseekCopilot.enableInline": true           // Toggle suggestions
}

🛠️ Development
 Prerequisites
  - Node.js ≥ 18
  - VS Code ≥ 1.85
  - DeepSeek API Key (Get Free Credits)


  
Command	Action
pnpm run compile 👉	Production build
pnpm run watch   👉	Dev mode (live reload)
pnpm run package 👉 Generate .vsix for testing
F5 in VS Code    👉	Launch debug session


Project Structure
deepSeek-copilot/
├── src/
│   ├── api/            # DeepSeek API client
│   ├── providers/      # VS Code language features
│   └── extension.ts    # Entry point
├── test/               # Vitest unit tests
└── package.json        # Extension manifest


❓ FAQ
Q: Why am I getting "402 Payment Required"?
A: Your DeepSeek account needs credits. Check balance:

Q: How do I disable inline suggestions?
"deepseekCopilot.enableInline": false

🤝 Contributing
1. Fork the repo
2. Create a branch: git checkout -b feature/your-idea
3. Commit changes: git commit -m 'Add awesome feature'
4. Push: git push origin feature/your-idea
5. Open a PR!

📜 License
MIT © Exodus_Tola