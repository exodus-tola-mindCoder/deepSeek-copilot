import * as vscode from 'vscode';

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sanitizeCode(code: string): string {
    // Remove potentially dangerous HTML/script tags
    return code.replace(/<[^>]*>/g, '');
}

function getWebviewContent(code: string, explanation: string): string {
    const sanitizedCode = sanitizeCode(code);
    const escapedCode = escapeHtml(sanitizedCode);
    const escapedExplanation = escapeHtml(explanation).replace(/\n/g, '<br>');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
            <title>Code Explanation</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                               Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    padding: 1rem;
                    line-height: 1.6;
                    color: #333;
                }
                pre {
                    background-color: #f5f5f5;
                    padding: 1rem;
                    border-radius: 4px;
                    overflow-x: auto;
                }
                .explanation {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-left: 4px solid #4CAF50;
                    border-radius: 4px;
                }
                h2, h3 {
                    color: #2c3e50;
                    margin-top: 0;
                }
                code {
                    background-color: #f5f5f5;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
                }
                .error {
                    color: #dc3545;
                    padding: 1rem;
                    background-color: #f8d7da;
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

// This file contains utility functions for code explanation
// The command registration has been moved to the main extension.ts file
// to avoid duplicate command registration issues

// Webview content generation functions remain here for code organization
