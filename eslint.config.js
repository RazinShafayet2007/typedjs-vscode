const path = require('path');

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      parser: path.resolve(__dirname, './server/parser.js'),
      ecmaVersion: 2024,
      sourceType: "module"
    },
    plugins: {
      typedjs: require('./server/index.js')
    },
    rules: {
      "typedjs/no-op": "error"
    }
  }
];