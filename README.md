# TypedJS for VS Code

![TypedJS Logo](images/icon.png)

Language support and validation for **TypedJS** - bringing type safety to JavaScript.

## Features

- 🎨 **Syntax Highlighting** - Colorful, readable code for `.js` files in TypedJS mode
- ✅ **Type Validation** - Integrated linting catches type errors early
- 📝 **Code Snippets** - Productivity-boosting snippets for `interface`, `type`, and more
- 💡 **IntelliSense** - Autocompletion for keywords and types
- 🔍 **Hover Information** - View full interface/variable definitions on hover

## Quick Start

1. Install the extension
2. Open a `.js` file
3. Change the language mode to **TypedJS** (bottom-right corner)
4. Start typing with type annotations!

```javascript
interface User {
    name: string;
    age: number;
}

const user: User = {
    name: "Razin",
    age: 18
};
```

## Snippets

| Prefix | Description |
|--------|-------------|
| `interface` | Create a new interface |
| `type` | Create a type alias |
| `log` | Console log statement |

## Requirements

- VS Code 1.80.0 or newer
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Known Issues

This is an early release. Please report issues on [GitHub](https://github.com/RazinShafayet2007/typedjs-vscode).

## Release Notes

### 0.0.1
- Initial release with syntax highlighting, validation, snippets, and hover information
