# TypedJS for VS Code

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/razinshafayet.typedjs-vscode?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=razinshafayet.typedjs-vscode)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/razinshafayet.typedjs-vscode?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=razinshafayet.typedjs-vscode)

![TypedJS Logo](images/icon.png)

Language support for **TypedJS** - bringing runtime type safety to JavaScript with comprehensive TypeScript-compatible type system.

## 🚀 Quick Start

### 1. Install the TypedJS CLI
```bash
npm install -g @razinshafayet/typedjs
```

### 2. Install this VS Code Extension

**From Marketplace:**
- Search for "TypedJS" in VS Code Extensions (Ctrl+Shift+X)
- Click Install

**From Command Line:**
```bash
code --install-extension razinshafayet.typedjs-vscode
```

### 3. Write TypedJS Code

Create a `.tjs` file:
```javascript
interface User {
    name: string;
    age: number;
}

const user: User = {
    name: "Razin",
    age: 18
};

console.log(user);
```

### 4. Run Your Code

**Development Mode** (with runtime type checking):
```bash
typedjs app.tjs
```

**Production Mode** (types stripped for performance):
```bash
typedjs app.tjs --prod
```

---

## ✨ Features

- 🎨 **Syntax Highlighting** - Full TypeScript syntax support for `.tjs` files
- ✅ **Type Validation** - Comprehensive type checking with detailed error messages
- 📝 **Code Snippets** - Quick scaffolding for interfaces, types, enums, and more
- 💡 **IntelliSense** - Smart autocompletion for all TypeScript types and keywords
- 🔍 **Hover Information** - View complete type definitions on hover
- 🚀 **Advanced Types** - Support for unions, intersections, tuples, generics, and more

## 📦 Code Snippets

| Prefix | Description |
|--------|-------------|
| `interface` | Create a new interface |
| `type` | Create a type alias |
| `log` | Console log statement |

## 🔧 Supported Type Features

### Basic Types
```javascript
let name: string = "TypedJS";
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let undef: undefined = undefined;
let big: bigint = 9007199254740991n;
let sym: symbol = Symbol("unique");
```

### Advanced Primitives
```javascript
let anyValue: any = "anything";
let unknownValue: unknown = "something";
let neverValue: never; // For functions that never return
let voidFunc: void; // For functions that don't return
```

### Interfaces
```javascript
interface Product {
    id: number;
    name: string;
    price: number;
    inStock?: boolean;  // Optional property
    readonly sku: string; // Readonly property
}

const laptop: Product = {
    id: 1,
    name: "MacBook",
    price: 1299,
    sku: "MBP-001"
};
```

### Type Aliases & Unions
```javascript
type ID = string | number;
type Status = "active" | "inactive" | "pending"; // Literal types

let userId: ID = 123;
let status: Status = "active";
```

### Intersection Types
```javascript
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const person: Person = {
    name: "Alice",
    age: 30
};
```

### Arrays & Tuples
```javascript
// Arrays
let scores: Array<number> = [10, 20, 30];
let names: string[] = ["Alice", "Bob"];

// Tuples
let point: [number, number] = [10, 20];
let namedPoint: [x: number, y: number] = [5, 10]; // Labeled tuple
let optional: [string, number?] = ["test"]; // Optional element
let rest: [string, ...number[]] = ["values", 1, 2, 3]; // Rest element
```

### Collections
```javascript
// Map
let userMap: Map<string, number> = new Map();
userMap.set("alice", 30);

// Set
let uniqueIds: Set<number> = new Set([1, 2, 3]);

// Record
type UserRecord = Record<string, number>;
const ages: UserRecord = { alice: 30, bob: 25 };
```

### Enums
```javascript
enum Color {
    Red,
    Green,
    Blue
}

enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE"
}

let color: Color = Color.Red;
let status: Status = Status.Active;
```

### Functions
```javascript
function add(a: number, b: number): number {
    return a + b;
}

// Function type
type MathOp = (a: number, b: number) => number;

// Optional parameters
function greet(name: string, title?: string): string {
    return title ? `Hello, ${title} ${name}` : `Hello, ${name}`;
}

// Rest parameters
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}
```

### Utility Types
```javascript
interface Todo {
    title: string;
    description: string;
    completed: boolean;
}

// Partial - all properties optional
type PartialTodo = Partial<Todo>;

// Required - all properties required
type RequiredTodo = Required<Todo>;

// Readonly - all properties readonly
type ReadonlyTodo = Readonly<Todo>;

// Pick - select specific properties
type TodoPreview = Pick<Todo, "title" | "completed">;

// Omit - exclude specific properties
type TodoInfo = Omit<Todo, "completed">;
```

### Template Literal Types
```javascript
type EventName = `on${Capitalize<string>}`;
type Direction = "left" | "right";
type Position = `${Direction}-${number}`;
```

## ⚙️ Requirements

- **VS Code** 1.80.0 or newer
- **Node.js** 14.0.0 or newer (for TypedJS CLI)
- **TypedJS CLI** - Install with: `npm install -g @razinshafayet/typedjs`

**Extension Features:**
- Built-in type validation - no additional setup required
- Works standalone without ESLint extension
- Comprehensive TypeScript type system support

## 🐛 Known Issues

This is version 0.0.5. Known limitations:

- Some advanced TypeScript features (mapped types, conditional types) are experimental
- Type inference is basic - explicit types recommended
- Cross-file type imports not yet supported

Please report issues on [GitHub](https://github.com/RazinShafayet2007/typedjs-vscode/issues).

## 🔗 Related Projects

**TypedJS CLI** - [npm](https://www.npmjs.com/package/@razinshafayet/typedjs) | [GitHub](https://github.com/RazinShafayet2007/typedjs)

The runtime and CLI tool for executing TypedJS code with comprehensive type support.

## 📋 Release Notes

### 0.0.5 (January 26, 2026)

**Major Update: Comprehensive Type System**

**Added:**
- 🎯 **Complete TypeScript Type System** - Support for all TypeScript types
- ✨ **Advanced Types** - Unions, intersections, tuples, generics, utility types
- 📦 **Enums** - Full enum support with string and numeric values
- 🔧 **Template Literals** - Template literal type support
- 🎨 **Literal Types** - String, number, and boolean literal types
- 🔄 **Utility Types** - Partial, Required, Readonly, Pick, Omit, Record
- 🎭 **Type Operators** - keyof, typeof, indexed access
- 📍 **Labeled Tuples** - Named tuple elements with optional and rest
- 🗺️ **Collections** - Map, Set, Record with full type safety
- 🎪 **Index Signatures** - Dynamic property types
- 🛡️ **Readonly Properties** - Immutability annotations

**Improved:**
- 🔍 **Enhanced Type Validation** - More accurate type checking
- 💡 **Better Error Messages** - Clear, actionable type errors
- 🚀 **Performance** - Optimized parser and validator
- 📝 **Hover Information** - Shows enum definitions

**Changed:**
- 🔄 **Standalone Validation** - Removed ESLint dependency
- 📦 **Built-in Linter** - Custom TypedJS linter integrated
- 🎨 **File Extension** - Uses `.tjs` for TypedJS files

### 0.0.4 (January 26, 2026)

**Changed:**
- 🔄 File extension changed from `.js` to `.tjs`
- 📦 ESLint integration improvements

### 0.0.3 (January 24, 2025)

**Changed:**
- ✨ Added CLI installation and usage instructions
- 📝 Improved documentation

### 0.0.2 (January 23, 2025)

**Changed:**
- 🧹 Removed redundant `activationEvents`

## 🤝 Contributing

Found a bug? Have a feature request? 

- [Report Issues](https://github.com/RazinShafayet2007/typedjs-vscode/issues)
- [Contribute on GitHub](https://github.com/RazinShafayet2007/typedjs-vscode)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Razin Shafayet](https://github.com/RazinShafayet2007)**