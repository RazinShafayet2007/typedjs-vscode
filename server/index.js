// eslint-plugin-typedjs/index.js
const parser = require("./parser");
const noOp = require("./rules/no-op");

// 1. Define the plugin object first
const plugin = {
  meta: {
    name: "eslint-plugin-typedjs",
    version: "0.1.0"
  },
  rules: {
    "no-op": noOp
  }
};

// 2. Assign the configuration
plugin.configs = {
  recommended: [
    {
      name: "typedjs/recommended",
      languageOptions: {
        parser: parser,
        ecmaVersion: 2024,
        sourceType: "module"
      },
      plugins: {
        typedjs: plugin // Points to the object we just built
      },
      rules: {
        "typedjs/no-op": "warn"
      }
    }
  ]
};

// 3. Export it
module.exports = plugin;