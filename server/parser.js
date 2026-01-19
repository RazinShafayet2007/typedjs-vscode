const acorn = require("acorn");
const acornTS = require("acorn-typescript");

const tsFactory = acornTS.default || acornTS;
const tsPlugin = tsFactory();

const TypedJSParser = acorn.Parser.extend(tsPlugin);

module.exports = {
  parseForESLint(code, options = {}) {
    // 1. Initialize arrays to collect tokens and comments
    const tokens = [];
    const comments = [];

    const parseOptions = {
      ...options,
      ecmaVersion: 2024,
      sourceType: "module",
      locations: true,
      ranges: true,
      // 2. Pass these arrays to Acorn to populate them during parsing
      onToken: tokens,
      onComment: comments
    };

    const ast = TypedJSParser.parse(code, parseOptions);

    // 3. Explicitly attach the collected tokens and comments to the AST
    ast.tokens = tokens;
    ast.comments = comments;

    return {
      ast,
      services: {},
      visitorKeys: TypedJSParser.acorn.visitorKeys || acorn.visitorKeys,
      scopeManager: null
    };
  }
};