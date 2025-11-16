# SlashDown

> For when MDX is too much, but Markdown is too little.

A lightweight markup language that combines the simplicity of Markdown with the flexibility of HTML. Perfect for HTMX, Tailwind CSS, and Alpine.js projects.

## Features

- ✅ **Intuitive Syntax** - Pug/Jade-like tag notation with CSS selectors
- ✅ **Markdown Compatible** - Full GitHub Flavored Markdown support
- ✅ **Type Safe** - Written in TypeScript with full type exports
- ✅ **Secure by Default** - Automatic HTML escaping prevents XSS
- ✅ **Extensible** - Custom renderers for any output format
- ✅ **Zero Config** - Works out of the box with sensible defaults

## Installation

```bash
npm install slashdown
```

## Basic Usage

```js
import { createSlashdown } from 'slashdown';

const sd = createSlashdown();
const html = sd`
  /header.flex.justify-between
    # Slashdown
    [Get it](#)

  /ul .grid.grid-cols-3
    /li
      ### Easy to read
      - lots of space

    /li
      ### Fast to write
      - type, type, type

    /li
      ### You already know it
      - Just markdown with extra oomph
`
```

## Syntax Guide

### Tags

Use `/` to create HTML tags:

```js
sd`/div`           // <div></div>
sd`/header`        // <header></header>
sd`/`              // <div></div> (shorthand)
```

### Classes and IDs

Use `.` for classes and `#` for IDs:

```js
sd`/div.container`                    // <div class="container"></div>
sd`/div.flex.items-center`            // <div class="flex items-center"></div>
sd`/div#header`                       // <div id="header"></div>
sd`/div#app.container.mx-auto`        // <div id="app" class="container mx-auto"></div>
```

### Attributes

Add attributes inline or on new lines:

```js
// Inline attributes
sd`/button type="submit" disabled`    // <button type="submit" disabled></button>

// Attributes on new lines
sd`
/button
  type="submit"
  disabled
  = Click me
`
```

### Text Content

Use `=` for inline text:

```js
sd`/h1 = Hello World`                 // <h1>Hello World</h1>
sd`/p .lead = Welcome to SlashDown`   // <p class="lead">Welcome to SlashDown</p>
```

### Markdown

Any content that doesn't start with `/` is treated as Markdown:

```js
sd`
/article
  # Main Heading

  This is a **paragraph** with _emphasis_.

  - List item 1
  - List item 2
`
```

### Nesting

Use indentation to create nested structures:

```js
sd`
/nav.navbar
  /ul.menu
    /li
      /a href="/" = Home
    /li
      /a href="/about" = About
`
```

## Working with HTMX

SlashDown is perfect for HTMX applications:

```js
sd`
/div.container
  /button.btn
    hx-get="/api/users"
    hx-trigger="click"
    hx-target="#results"
    hx-swap="innerHTML"
    = Load Users

  /div#results
    Loading...
`
```

## Working with Tailwind CSS

Easily compose Tailwind utility classes:

```js
sd`
/div.flex.flex-col.gap-4.p-6
  /h1.text-3xl.font-bold.text-gray-900
    = Welcome

  /p.text-gray-600
    = Your beautiful Tailwind-powered content
`
```

## Working with Alpine.js

Combine with Alpine.js directives:

```js
sd`
/div x-data="{ open: false }"
  /button.btn
    @click="open = !open"
    = Toggle

  /div x-show="open" .panel
    = Hidden content
`
```

## Configuration Options

```js
const sd = createSlashdown({
  renderer: HTMLRenderer,      // Custom renderer (default: HTMLRenderer)
  defaultTag: 'div',           // Default tag for `/` (default: 'div')
  maxDepth: 100                // Maximum nesting depth (default: 100)
});
```

## Alternate Renderers

### JSON Renderer

```js
import { createSlashdown, JSONRenderer } from 'slashdown';
const sd = createSlashdown({ renderer: JSONRenderer });

const ast = sd`/h1 = Hello World`;
/* Returns:
  [{
    "type": "Tag",
    "tagName": "h1",
    "children": [
      {
        "type": "Text",
        "content": "Hello World"
      }
    ]
  }]
*/
```

### Custom Renderers

Create your own renderer by implementing the `SD.Renderer` interface:

```typescript
import type { SD } from 'slashdown';

class CustomRenderer implements SD.Renderer {
  render(ast: SD.Ast): string {
    // Your rendering logic here
    return ast.map(node => this.renderNode(node)).join('');
  }

  private renderNode(node: SD.Node): string {
    // Handle different node types
    switch (node.type) {
      case 'Tag':
        return this.renderTag(node as SD.TagNode);
      case 'Text':
        return (node as SD.TextNode).content;
      case 'Markdown':
        return this.renderMarkdown(node as SD.MarkdownNode);
    }
  }

  // Implement other methods...
}
```

## Security

SlashDown automatically escapes HTML special characters in text nodes and attributes to prevent XSS attacks:

```js
sd`/div = <script>alert('xss')</script>`
// Output: <div>&lt;script&gt;alert('xss')&lt;/script&gt;</div>
```

This is safe by default - markdown content is processed by `micromark` which also handles security properly.

## API Reference

### `createSlashdown(options?)`

Creates a SlashDown processor with tagged template literal support.

**Parameters:**
- `options.renderer` - Custom renderer class (default: `HTMLRenderer`)
- `options.defaultTag` - Default tag for `/` shorthand (default: `'div'`)
- `options.maxDepth` - Maximum nesting depth (default: `100`)

**Returns:** Tagged template function

### `new Slashdown(options?)`

Creates a SlashDown processor instance.

**Methods:**
- `process(src: string): string` - Process source through full pipeline
- `tokenize(): this` - Tokenize source into tokens
- `parse(): this` - Parse tokens into AST
- `render(): string` - Render AST to output

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Build
npm run build

# Development mode
npm run dev
```

## Known Issues

- Code fences not yet fully supported
- IDs/class shorthand can conflict with id/class attributes (use one or the other)

## Roadmap

- ✅ HTML escaping for security
- ✅ Configuration options
- ✅ Type exports for custom renderers
- ⬜ Full code fence support
- ⬜ Conformance to the Unist specification
- ⬜ Renderers for popular component frameworks (React, Svelte, Vue)
- ⬜ Fragment support (`/` as `<></>` in React/JSX)

## License

MIT © Nick Noble

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.