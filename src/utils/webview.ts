import * as vscode from 'vscode';

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function getWebviewContent(code: string, explanation: string, languageId: string = 'clike'): string {
    // For displaying code, escaping is sufficient to prevent XSS.
    // SanitizeCode might be too aggressive and remove valid code parts like generics.
    const escapedCode = escapeHtml(code);
    const escapedExplanation = escapeHtml(explanation).replace(/\n/g, '<br>');
    const prismTheme = 'prism-okaidia.css'; // Example theme, can be made configurable or use a default
    const prismCore = 'prism.min.js';
    const prismClike = 'prism-clike.min.js'; // Base for many languages
    const prismLang = languageId !== 'clike' && languageId !== 'plaintext' ? `prism-${languageId}.min.js` : '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" 
                  content="default-src 'none'; 
                           style-src 'unsafe-inline' https://cdnjs.cloudflare.com; 
                           script-src 'unsafe-inline' https://cdnjs.cloudflare.com;">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/${prismTheme}" />
            <title>Code Explanation</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                               Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    padding: 1rem;
                    line-height: 1.6;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                    font-size: var(--vscode-editor-font-size);
                }
                pre {
                    background-color: var(--vscode-textBlockQuote-background);
                    padding: 1rem;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-family: var(--vscode-editor-font-family);
                }
                .explanation {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-left: 4px solid var(--vscode-textLink-activeForeground);
                    border-radius: 4px;
                }
                h2, h3 {
                    color: var(--vscode-titleBar-activeForeground);
                    margin-top: 0;
                }
                code {
                    background-color: var(--vscode-textBlockQuote-background);
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: var(--vscode-editor-font-family);
                }
                .error {
                    color: var(--vscode-errorForeground);
                    padding: 1rem;
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border-radius: 4px;
                    margin-top: 1rem;
                }
            </style>
        </head>
        <body>
            <h2>Code Explanation</h2>
            <h3>Selected Code:</h3>
            <pre><code>${escapedCode}</code></pre>
            <div class="explanation">
                <h3>Explanation:</h3>
                <p>${escapedExplanation}</p>
            </div>
        </body>
        </html>
    `;
} 