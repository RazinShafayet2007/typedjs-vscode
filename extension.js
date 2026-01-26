const vscode = require('vscode');
const { Linter } = require('eslint');
const path = require('path');
const fs = require('fs');

// Import local validation logic
const parser = require('./server/parser');
const noOpRule = require('./server/rules/no-op');

// Diagnostic Collection
let diagnosticCollection;

function activate(context) {
    console.log('TypedJS Extension is active!');

    // Initialize Diagnostics
    diagnosticCollection = vscode.languages.createDiagnosticCollection('typedjs');
    context.subscriptions.push(diagnosticCollection);

    // Initialize Linter
    const linter = new Linter();
    linter.defineParser('typedjs-parser', parser);
    linter.defineRule('typedjs/no-op', noOpRule);

    const lintConfig = {
        parser: 'typedjs-parser',
        rules: {
            'typedjs/no-op': 'error' // Ensure our rule runs
        },
        env: {
            es6: true
        }
    };

    // Validation Function
    function validateTextDocument(document) {
        if (document.languageId !== 'typedjs') {
            return;
        }

        const text = document.getText();
        try {
            const messages = linter.verify(text, lintConfig);

            const diagnostics = messages.map(msg => {
                const range = new vscode.Range(
                    new vscode.Position(msg.line - 1, msg.column - 1),
                    new vscode.Position(msg.endLine ? msg.endLine - 1 : msg.line - 1, msg.endColumn ? msg.endColumn - 1 : msg.column)
                );

                const severity = msg.severity === 2 ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;

                const diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                diagnostic.source = 'typedjs';
                diagnostic.code = msg.ruleId;

                return diagnostic;
            });

            diagnosticCollection.set(document.uri, diagnostics);

        } catch (err) {
            console.error('Linting failed:', err);
        }
    }

    // Event Listeners for Validation
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(validateTextDocument),
        vscode.workspace.onDidChangeTextDocument(event => validateTextDocument(event.document)),
        vscode.workspace.onDidSaveTextDocument(validateTextDocument),
        vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
    );

    // Initial validation of open documents
    vscode.workspace.textDocuments.forEach(validateTextDocument);

    // Register autocompletion (Basic keyword/type support)
    const completionProvider = vscode.languages.registerCompletionItemProvider('typedjs', {
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

    context.subscriptions.push(completionProvider);

    // Register hover provider with safer Regex
    const hoverProvider = vscode.languages.registerHoverProvider('typedjs', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) return undefined;

            const word = document.getText(range);
            if (!word) return undefined;

            // Escape special regex characters to prevent errors
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const text = document.getText();
            const lines = text.split('\n');
            let matchedLine = null;
            let type = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Match interface
                // Use strict regex for better accuracy
                if (new RegExp(`^\\s*interface\\s+${escapedWord}\\b`).test(line)) {
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
                if (new RegExp(`^\\s*type\\s+${escapedWord}\\b`).test(line)) {
                    matchedLine = line.trim();
                    type = 'type';
                    break;
                }

                // Match function
                if (new RegExp(`^\\s*function\\s+${escapedWord}\\s*\\(`).test(line)) {
                    matchedLine = line.trim();
                    type = 'function';
                    break;
                }

                // Match variable
                if (new RegExp(`^\\s*(const|let|var)\\s+${escapedWord}\\b\\s*[:=]`).test(line)) {
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
                md.appendCodeblock(cleanedLine, 'javascript'); // Using javascript highlighting for now
                md.appendMarkdown(`\n\n**(${type})**`);
                return new vscode.Hover(md);
            }

            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);

    // Optional: Check if eslint is installed in workspace for user's own scripts
    // Only prompts if package.json exists but eslint is missing, to follow user's request.
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const rootPath = workspaceFolders[0].uri.fsPath;
        const packageJsonPath = path.join(rootPath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            // Check if eslint is in package.json
            try {
                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
                if (!allDeps.eslint) {
                    vscode.window.showInformationMessage('Would you like to install ESLint for CLI support?', 'Yes', 'No').then(sel => {
                        if (sel === 'Yes') {
                            const term = vscode.window.createTerminal('TypedJS Setup');
                            term.show();
                            term.sendText('npm install eslint --save-dev');
                        }
                    });
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }
}

function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}

module.exports = { activate, deactivate };