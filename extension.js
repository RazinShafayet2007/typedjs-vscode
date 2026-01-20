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
}

function deactivate() {}

module.exports = { activate, deactivate };