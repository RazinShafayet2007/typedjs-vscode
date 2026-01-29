# Changelog

All notable changes to the **TypedJS** VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- Add upcoming changes here -->

---

## [0.0.5] - 2026-01-26

### Major Update: Comprehensive TypeScript Type System

### Added
- 🎯 **Complete TypeScript Type System** - Full support for TypeScript types
  - Primitives: string, number, boolean, null, undefined, bigint, symbol
  - Special types: any, unknown, void, never, object
  - Literal types: string, number, boolean literals
  - Union types: `type ID = string | number`
  - Intersection types: `type Person = Named & Aged`
  - Tuple types: `[number, string]` with labeled, optional, and rest elements
  - Array types: `Array<T>`, `T[]`, `ReadonlyArray<T>`
  - Object types: interfaces with optional and readonly properties
  - Function types: with parameters, return types, and overloads
  - Index signatures: `[key: string]: ValueType`
  - Enum types: numeric and string enums with full validation

- ✨ **Advanced Type Features**
  - Template literal types: `` type EventName = `on${string}` ``
  - Conditional types: `T extends U ? X : Y`
  - Mapped types: `{ [K in keyof T]: T[K] }`
  - Type operators: `keyof`, `typeof`, indexed access
  - Utility types: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `Exclude<T, U>`, `Extract<T, U>`, `NonNullable<T>`

- 📦 **Collection Types**
  - `Map<K, V>` with key and value type validation
  - `Set<T>` with element type validation
  - `Record<K, V>` for object with dynamic keys
  - `Promise<T>` for async operations

- 🔧 **Enhanced Type Validation**
  - Deep object validation with nested types
  - Array element type checking
  - Tuple length and type validation
  - Enum value validation
  - Union type matching
  - Intersection type enforcement
  - Optional property handling
  - Readonly property detection

- 💡 **Better Developer Experience**
  - Clear, actionable error messages
  - Type mismatch details with expected vs actual
  - Missing property warnings
  - Extra property detection
  - Hover shows full enum definitions
  - IntelliSense for all TypeScript types

### Improved
- 🔍 **Enhanced Validation Engine** - More accurate and comprehensive type checking
- 🚀 **Performance** - Optimized parser for faster validation
- 📝 **Error Messages** - Detailed type information in diagnostics
- 🎨 **Syntax Highlighting** - Full TypeScript syntax support

### Changed
- 🔄 **Standalone Validation** - Removed ESLint dependency for cleaner integration
- 📦 **Built-in Linter** - Custom TypedJS validation engine
- 🎯 **File Extension** - Uses `.tjs` extension for TypedJS files
- 🔧 **Architecture** - Streamlined extension with integrated type checker

### Fixed
- 🐛 **Type Resolution** - Improved type alias and interface resolution
- 🔧 **Parse Errors** - Better error handling for malformed types
- 💾 **Memory** - Reduced memory usage for large files

---

## [0.0.4] - 2026-01-26

### Added
- 🔄 Seamless ESLint integration
- ⚙️ Automatic ESLint configuration
- 🛡️ Comprehensive .gitignore

### Fixed
- 🐛 Fixed ESLint installation
- 🚫 Eliminated .vscode/settings.json auto-generation
- 🔧 Simplified extension activation

### Changed
- 🔄 File extension changed from `.js` to `.tjs`
- 📦 ESLint bundle strategy improved
- 🎨 Extension works immediately after installation

---

## [0.0.3] - 2025-01-24

### Added
- 📚 Comprehensive CLI installation and usage instructions
- ✨ Complete quick start guide
- 🔗 Links to TypedJS CLI npm package
- 📝 Additional code examples
- 🎯 Clear dev/prod mode distinction

### Changed
- 📖 Restructured README for better onboarding
- 🔧 Improved documentation

---

## [0.0.2] - 2025-01-23

### Changed
- 🧹 Removed redundant `activationEvents` from `package.json`

---

## [0.0.1] - 2025-01-23

### Added
- 🎨 Syntax highlighting for TypedJS
- ✅ Type validation with ESLint
- 📝 Code snippets (interface, type, log)
- 💡 IntelliSense support
- 🔍 Hover information
- Initial language configuration
- VS Code 1.80.0+ support

### Dependencies
- acorn (^8.15.0) for parsing
- acorn-typescript (^1.4.13) for TypeScript syntax

---

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=razinshafayet.typedjs-vscode)
- [GitHub Repository](https://github.com/RazinShafayet2007/typedjs-vscode)
- [Report Issues](https://github.com/RazinShafayet2007/typedjs-vscode/issues)
- [TypedJS CLI on npm](https://www.npmjs.com/package/@razinshafayet/typedjs)