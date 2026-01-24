# Changelog

All notable changes to the **TypedJS** VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- Add upcoming changes here -->

---

## [0.0.3] - 2025-01-24

### Added
- 📚 Comprehensive CLI installation and usage instructions in README
- ✨ Complete quick start guide with step-by-step setup
- 🔗 Links to TypedJS CLI npm package and GitHub repository
- 📝 Additional code examples for interfaces, type aliases, arrays, and functions
- 🎯 Clear distinction between development and production modes

### Changed
- 📖 Restructured README for better user onboarding
- 🔧 Improved documentation clarity and organization

---

## [0.0.2] - 2025-01-23

### Changed
- 🧹 Removed redundant `activationEvents` from `package.json` - VS Code now auto-generates these from contribution declarations

---

## [0.0.1] - 2025-01-23

### Added
- 🎨 **Syntax Highlighting** - Full syntax highlighting support for `.js` files in TypedJS mode
- ✅ **Type Validation** - Integrated ESLint-based linting to catch type errors early
- 📝 **Code Snippets** - Productivity-boosting snippets:
  - `interface` - Create a new interface
  - `type` - Create a type alias
  - `log` - Console log statement
- 💡 **IntelliSense** - Autocompletion support for TypedJS keywords and types
- 🔍 **Hover Information** - View full interface and variable definitions on hover
- Initial language configuration for TypedJS
- Support for VS Code 1.80.0 and newer

### Dependencies
- Added `acorn` (^8.15.0) for JavaScript parsing
- Added `acorn-typescript` (^1.4.13) for TypeScript syntax support

---

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=razinshafayet.typedjs-vscode)
- [GitHub Repository](https://github.com/RazinShafayet2007/typedjs-vscode)
- [Report Issues](https://github.com/RazinShafayet2007/typedjs-vscode/issues)
- [TypedJS CLI on npm](https://www.npmjs.com/package/@razinshafayet/typedjs)