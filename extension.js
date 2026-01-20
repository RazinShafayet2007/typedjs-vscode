const vscode = require('vscode');
const path = require('path');

function activate(context) {
    console.log('TypedJS Extension is active!');

    // 1. Get the path to your bundled plugin inside the extension folder
    const pluginPath = path.join(context.extensionPath, 'server');

    // 2. Configure the generic ESLint extension to use YOUR plugin
    const eslintConfig = vscode.workspace.getConfiguration('eslint');
    
    // Ensure 'typedjs' is in the validate list
    let validate = eslintConfig.get('validate') || [];
    if (!validate.includes('typedjs')) {
        validate.push('typedjs');
        eslintConfig.update('validate', validate, vscode.ConfigurationTarget.Global);
    }

    // Force ESLint to load the plugin from the 'server' folder
    // This makes it work without the user installing npm packages!
    // Force ESLint to recognize the language and use your rules
    eslintConfig.update('options', {
        "overrideConfig": {
            "languageOptions": {
                // Use the absolute path STRING to your parser
                "parser": path.join(pluginPath, 'parser.js')
            },
            "rules": {
                "no-op": "error"
            }
        },
        // Tell ESLint where to look for rule definitions
        "rulePaths": [ path.join(pluginPath, 'rules') ]
    }, vscode.ConfigurationTarget.Workspace);

    // 3. Register Basic Autocompletion Provider
    const provider = vscode.languages.registerCompletionItemProvider('typedjs', {
        provideCompletionItems(document, position, token, context) {
            // Basic keywords
            const keywords = [
                'interface', 'type', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export'
            ];
            
            // Basic types
            const types = [
                'string', 'number', 'boolean', 'any', 'void', 'object', 'undefined', 'null'
            ];

            const completions = [
                ...keywords.map(k => new vscode.CompletionItem(k, vscode.CompletionItemKind.Keyword)),
                ...types.map(t => new vscode.CompletionItem(t, vscode.CompletionItemKind.Class)) // Class Icon looks like a type
            ];

            return completions;
        }
    });

    context.subscriptions.push(provider);

    // 4. Register Basic Hover Provider
    const hoverProvider = vscode.languages.registerHoverProvider('typedjs', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

            if (!word) {
                return undefined;
            }

            // Simple regex-based local definition search
            // This reads the entire text (fine for small/medium files) so it works "globally" in the file
            const text = document.getText();
            
            // Patterns to look for:
            // 1. interface Name { ... } (capture Name)
            // 2. type Name = ... (capture Name)
            // 3. function Name(...) (capture Name)
            // 4. const/let/var Name = ... (capture Name)
            
            // We search line by line to get context
            const lines = text.split('\n');
            let matchedLine = null;
            let type = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for Interface
                if (line.includes(`interface ${word}`)) {
                    matchedLine = line.trim(); // Just the header for now, or could capture block
                    type = 'interface';
                    break;
                }
                // Check for Type Alias
                if (line.includes(`type ${word}`)) {
                    matchedLine = line.trim();
                    type = 'type';
                    break;
                }
                 // Check for Function
                 if (line.match(new RegExp(`function\\s+${word}\\s*\\(`))) {
                    matchedLine = line.trim();
                    type = 'function';
                    break;
                }
                // Check for Variables
                if (line.match(new RegExp(`(const|let|var)\\s+${word}\\s*=`)) || line.match(new RegExp(`(const|let|var)\\s+${word}\\s*:`))) {
                     matchedLine = line.trim();
                     type = 'variable';
                     break;
                 }
            }

            if (matchedLine) {
                const md = new vscode.MarkdownString();
                md.appendCodeblock(matchedLine, 'typedjs');
                md.appendMarkdown(`**(${type})**`);
                return new vscode.Hover(md);
            }

            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = { activate, deactivate };