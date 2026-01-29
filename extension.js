const vscode = require('vscode');
const { Linter } = require('eslint');

const parser = require('./server/parser');
const noOpRule = require('./server/rules/no-op');

let diagnosticCollection;

function activate(context) {
    console.log('TypedJS Extension is active!');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('typedjs');
    context.subscriptions.push(diagnosticCollection);

    const linter = new Linter();
    linter.defineParser('typedjs-parser', parser);
    linter.defineRule('typedjs/no-op', noOpRule);

    const lintConfig = {
        parser: 'typedjs-parser',
        parserOptions: {
            ecmaVersion: 2024,
            sourceType: 'module'
        },
        rules: {
            'typedjs/no-op': 'error'
        }
    };

    function validateTextDocument(document) {
        if (document.languageId !== 'typedjs') {
            diagnosticCollection.delete(document.uri);
            return;
        }

        const text = document.getText();

        try {
            const messages = linter.verify(text, lintConfig);

            const diagnostics = messages.map(msg => {
                const range = new vscode.Range(
                    new vscode.Position(Math.max(0, msg.line - 1), Math.max(0, msg.column - 1)),
                    new vscode.Position(
                        Math.max(0, (msg.endLine || msg.line) - 1),
                        Math.max(0, msg.endColumn || msg.column)
                    )
                );

                const severity = msg.severity === 2
                    ? vscode.DiagnosticSeverity.Error
                    : vscode.DiagnosticSeverity.Warning;

                const diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                diagnostic.source = 'typedjs';
                if (msg.ruleId) {
                    diagnostic.code = msg.ruleId;
                }

                return diagnostic;
            });

            diagnosticCollection.set(document.uri, diagnostics);

        } catch (err) {
            console.error('TypedJS validation error:', err);
            // Show parse errors as diagnostics
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `Parse error: ${err.message}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'typedjs';
            diagnosticCollection.set(document.uri, [diagnostic]);
        }
    }

    // Event listeners
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(validateTextDocument),
        vscode.workspace.onDidChangeTextDocument(e => validateTextDocument(e.document)),
        vscode.workspace.onDidSaveTextDocument(validateTextDocument),
        vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
    );

    // Initial validation
    vscode.workspace.textDocuments.forEach(validateTextDocument);

    // Completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider('typedjs', {
        provideCompletionItems() {
            const keywords = [
                'interface', 'type', 'enum', 'function', 'const', 'let', 'var',
                'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export',
                'async', 'await', 'try', 'catch', 'finally'
            ];

            const types = [
                'string', 'number', 'boolean', 'any', 'void', 'never', 'unknown',
                'object', 'undefined', 'null', 'bigint', 'symbol',
                'Array', 'Map', 'Set', 'Promise', 'Record', 'Partial', 'Required',
                'Readonly', 'Pick', 'Omit'
            ];

            return [
                ...keywords.map(k => new vscode.CompletionItem(k, vscode.CompletionItemKind.Keyword)),
                ...types.map(t => new vscode.CompletionItem(t, vscode.CompletionItemKind.Class))
            ];
        }
    });

    context.subscriptions.push(completionProvider);

    // Hover provider (keep existing implementation)
    const hoverProvider = vscode.languages.registerHoverProvider('typedjs', {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) return undefined;

            const word = document.getText(range);
            if (!word) return undefined;

            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const text = document.getText();
            const lines = text.split('\n');
            let matchedLine = null;
            let type = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

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

                if (new RegExp(`^\\s*type\\s+${escapedWord}\\b`).test(line)) {
                    matchedLine = line.trim();
                    type = 'type';
                    break;
                }

                if (new RegExp(`^\\s*enum\\s+${escapedWord}\\b`).test(line)) {
                    let braceCount = 0;
                    let blockLines = [];
                    for (let j = i; j < lines.length; j++) {
                        blockLines.push(lines[j]);
                        braceCount += (lines[j].match(/{/g) || []).length;
                        braceCount -= (lines[j].match(/}/g) || []).length;
                        if (braceCount === 0 && blockLines.length > 0) break;
                    }
                    matchedLine = blockLines.join('\n');
                    type = 'enum';
                    break;
                }

                if (new RegExp(`^\\s*function\\s+${escapedWord}\\s*\\(`).test(line)) {
                    matchedLine = line.trim();
                    type = 'function';
                    break;
                }

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
                md.appendCodeblock(cleanedLine, 'typescript');
                md.appendMarkdown(`\n\n**(${type})**`);
                return new vscode.Hover(md);
            }

            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);
}

function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}

module.exports = { activate, deactivate };