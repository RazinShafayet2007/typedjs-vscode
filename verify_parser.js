const parser = require('./server/parser.js');
const assert = require('assert');

const code = `
interface User {
    name: string;
    age: number;
}

const u: User = {
    name: "Alice",
    age: 30
};
`;

try {
    console.log('Parsing code...');
    const result = parser.parseForESLint(code);
    const ast = result.ast;

    // Check for TSInterfaceDeclaration
    const interfaceDecl = ast.body.find(node => node.type === 'TSInterfaceDeclaration');
    if (!interfaceDecl) {
        console.error('FAILED: TSInterfaceDeclaration not found in AST');
    } else {
        console.log('SUCCESS: TSInterfaceDeclaration found.');
    }

    // Check for TSVariableDeclarator (Note: Standard AST uses VariableDeclarator, checks if type annotation is present)
    // Actually, acorn-typescript might produce standard VariableDeclarator with typeAnnotation
    const varDecl = ast.body.find(node => node.type === 'VariableDeclaration');
    if (varDecl) {
        const declarator = varDecl.declarations[0];
        console.log('Declarator Type:', declarator.type);
        console.log('Declarator ID Type:', declarator.id.type);
        if (declarator.id.typeAnnotation) {
            console.log('SUCCESS: TypeAnnotation found on ID.');
            console.log('Annotation Type:', declarator.id.typeAnnotation.type);
        } else {
            console.error('FAILED: No TypeAnnotation on ID.');
        }
    }

    // Check tokens
    if (ast.tokens && ast.tokens.length > 0) {
        console.log('SUCCESS: Tokens attached.');
    } else {
        console.error('FAILED: No tokens attached.');
    }

} catch (e) {
    console.error('Parsing threw error:', e);
}
