const acorn = require("acorn");
const acornTS = require("acorn-typescript");

const tsFactory = acornTS.default || acornTS;
const tsPlugin = tsFactory();

const TypedJSParser = acorn.Parser.extend(tsPlugin);

module.exports = {
  parseForESLint(code, options = {}) {
    const tokens = [];
    const comments = [];

    const parseOptions = {
      ...options,
      ecmaVersion: 2024,
      sourceType: "module",
      locations: true,
      ranges: true,
      onToken: tokens,
      onComment: comments
    };

    try {
      const ast = TypedJSParser.parse(code, parseOptions);

      // Attach tokens and comments
      ast.tokens = tokens;
      ast.comments = comments;

      return {
        ast,
        services: {},
        visitorKeys: TypedJSParser.acorn.visitorKeys || acorn.visitorKeys,
        scopeManager: null
      };
    } catch (error) {
      // Return valid structure even on parse errors
      console.error('TypedJS parse error:', error);
      return {
        ast: {
          type: 'Program',
          body: [],
          sourceType: 'module',
          tokens: [],
          comments: []
        },
        services: {},
        visitorKeys: acorn.visitorKeys,
        scopeManager: null
      };
    }
  }
};