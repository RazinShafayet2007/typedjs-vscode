const vscode = require('vscode');

function activate(context) {
    console.log('TypedJS Extension is active!');

    // Check for ESLint extension (but don't block if missing)
    const eslintExtension = vscode.extensions.getExtension('dbaeumer.vscode-eslint');
    
    if (!eslintExtension) {
        vscode.window.showWarningMessage(
            'TypedJS works best with ESLint extension. Install it for full type validation.',
            'Install ESLint'
        ).then(selection => {
            if (selection === 'Install ESLint') {
                vscode.commands.executeCommand('workbench.extensions.installExtension', 'dbaeumer.vscode-eslint');
            }
        });
    }

    // Register autocompletion (works without ESLint)
    const provider = vscode.languages.registerCompletionItemProvider('typedjs', {
        provideCompletionItems(document, position, token, context) {
            const keywords = [
                'interface', 'type', 'function', 'const', 'let', 'var', 
                'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export'
            ];
            
            const types = [
                'string', 'number', 'boolean', 'any', 'void', 'object', 
                'undefined', 'null', 'Array', 'Map', 'Set'
            ];

            return [
                ...keywords.map(k => new vscode.CompletionItem(k, vscode.CompletionItemKind.Keyword)),
                ...types.map(t => new vscode.CompletionItem(t, vscode.CompletionItemKind.Class))
            ];
        }
    });

    context.subscriptions.push(provider);

    // Register hover provider (works without ESLint)
    const hoverProvider = vscode.languages.registerHoverProvider('typedjs', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

            if (!word) return undefined;

            const text = document.getText();
            const lines = text.split('\n');
            let matchedLine = null;
            let type = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Match interface
                if (new RegExp(`^\\s*interface\\s+${word}\\b`).test(line)) {
                    let braceCount = 0;
                    let blockLines = [];
                    for (let j = i; j < lines.length; j++) {
                        blockLines.push(lines[j]);
                        braceCount += (lines[j].match(/{/g) || []).length;
                        braceCount -= (lines[j].match(/}/g) || []).length;
                        if (braceCount === 0 && blockLines.length > 0) break;
                    }
                    matchedLine = blockLines.join('\n');
                    type = 'interface';
                    break;
                }
                
                // Match type alias
                if (new RegExp(`^\\s*type\\s+${word}\\b`).test(line)) {
                    matchedLine = line.trim();
                    type = 'type';
                    break;
                }
                
                // Match function
                if (new RegExp(`^\\s*function\\s+${word}\\s*\\(`).test(line)) {
                    matchedLine = line.trim();
                    type = 'function';
                    break;
                }
                
                // Match variable
                if (new RegExp(`^\\s*(const|let|var)\\s+${word}\\b\\s*[:=]`).test(line)) {
                    if (line.includes('{')) {
                        let braceCount = 0;
                        let blockLines = [];
                        for (let j = i; j < lines.length; j++) {
                            blockLines.push(lines[j]);
                            braceCount += (lines[j].match(/{/g) || []).length;
                            braceCount -= (lines[j].match(/}/g) || []).length;
                            if (braceCount === 0 && blockLines.length > 0) break;
                        }
                        matchedLine = blockLines.join('\n');
                    } else {
                        matchedLine = line.trim();
                    }
                    type = 'variable';
                    break;
                }
            }

            if (matchedLine) {
                const cleanedLine = matchedLine
                    .split('\n')
                    .map(l => l.replace(/\/\/.*$/, '').trimEnd())
                    .join('\n');
                
                const md = new vscode.MarkdownString();
                md.appendCodeblock(cleanedLine, 'javascript');
                md.appendMarkdown(`\n\n**(${type})**`);
                return new vscode.Hover(md);
            }

            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = { activate, deactivate };