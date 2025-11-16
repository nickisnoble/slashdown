# SlashDown + Unified Integration Architecture

This document outlines the technical architecture for integrating SlashDown with the unified ecosystem.

## Table of Contents

- [Overview](#overview)
- [Package Structure](#package-structure)
- [AST Structure (slast)](#ast-structure-slast)
- [Migration Strategy](#migration-strategy)
- [Implementation Plan](#implementation-plan)

---

## Overview

### Current Architecture

```
Input String
    ↓
[Lexer] → Tokens
    ↓
[Parser] → AST (with Markdown as strings)
    ↓
[Renderer] → HTML
```

### Proposed Architecture

```
Input String
    ↓
[Lexer] → Tokens
    ↓
[Parser] → slast (SlashDown nodes)
    ↓
[Markdown Handler] → Parse markdown strings → mdast nodes
    ↓
Hybrid slast tree (with mdast children)
    ↓
[Compiler/Transformer] → Output (HTML, markdown, etc.)
```

---

## Package Structure

### Monorepo vs Single Package

**Recommendation: Start with single package, split later**

```
slashdown/
├── src/
│   ├── lexer.ts              # Tokenization (exists)
│   ├── parser.ts             # Token → slast (modified)
│   ├── markdown-handler.ts   # Parse markdown → mdast (new)
│   ├── processors/           # Unified processors (new)
│   │   ├── parse.ts         # slashdown-parse plugin
│   │   ├── stringify.ts     # slashdown-stringify plugin
│   │   └── to-html.ts       # slashdown-to-html compiler
│   ├── transforms/          # Utility transforms (new)
│   │   ├── slast-to-hast.ts
│   │   ├── slast-to-mdast.ts
│   │   └── mdast-to-slast.ts
│   └── types.d.ts           # Type definitions (modified)
```

### Future: Separate Packages (like remark)

```
- slashdown              # Main package (unified + parse + stringify)
- slashdown-parse        # Parser only
- slashdown-stringify    # Compiler only
- slashdown-cli          # CLI tool
- slashdown-util-*       # Utilities for slast manipulation
```

---

## AST Structure (slast)

### Hybrid AST Approach

**slast** = SlashDown AST that **contains** mdast nodes

```typescript
// SlashDown-specific nodes
type SlashDownTag = {
  type: 'slashdownTag'      // Distinguishable from HTML tags
  tagName: string
  attributes?: Record<string, string | boolean>
  classes?: string[]
  ids?: string[]
  children: (SlashDownTag | MdastNode)[]  // ✅ Can contain mdast!
  position?: Position
  data?: any
}

// No more "Markdown" or "Text" nodes!
// Instead, markdown content becomes mdast nodes directly:
// - heading, paragraph, list, emphasis, strong, code, etc.
```

### Type Definitions

```typescript
// types.d.ts
import type { Node as UnistNode, Position } from 'unist'
import type { Content as MdastContent } from 'mdast'

export declare namespace Slast {
  // Base node extends unist
  interface Node extends UnistNode {
    type: string
    position?: Position
    data?: any
  }

  // SlashDown Tag node
  interface Tag extends Node {
    type: 'slashdownTag'
    tagName: string
    attributes?: Record<string, string | boolean>
    classes?: string[]
    ids?: string[]
    children: (Tag | MdastContent)[]  // Hybrid!
  }

  // Root node (like mdast Root)
  interface Root extends Node {
    type: 'root'
    children: (Tag | MdastContent)[]
  }

  // Handler configuration
  interface MarkdownHandlerOptions {
    parser?: 'remark-parse' | Function
    plugins?: Array<Plugin | [Plugin, Options]>
    options?: any
  }
}
```

### Example AST

**Input:**
```
/article .prose
  # Hello World

  This is **important**.

  /button #cta
    Click me
```

**Current AST (❌ Bad):**
```json
[{
  "type": "Tag",
  "tagName": "article",
  "classes": ["prose"],
  "children": [
    {
      "type": "Markdown",
      "content": "# Hello World\n\nThis is **important**."
    },
    {
      "type": "Tag",
      "tagName": "button",
      "ids": ["cta"],
      "children": [
        { "type": "Text", "content": "Click me" }
      ]
    }
  ]
}]
```

**New AST (✅ Good - Hybrid slast/mdast):**
```json
{
  "type": "root",
  "children": [{
    "type": "slashdownTag",
    "tagName": "article",
    "classes": ["prose"],
    "children": [
      {
        "type": "heading",
        "depth": 1,
        "children": [
          { "type": "text", "value": "Hello World" }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          { "type": "text", "value": "This is " },
          {
            "type": "strong",
            "children": [
              { "type": "text", "value": "important" }
            ]
          },
          { "type": "text", "value": "." }
        ]
      },
      {
        "type": "slashdownTag",
        "tagName": "button",
        "ids": ["cta"],
        "children": [
          { "type": "text", "value": "Click me" }
        ]
      }
    ]
  }]
}
```

---

## Migration Strategy

### Phase 1: Add Hybrid AST Support (Breaking Change)

**Version: 1.0.0**

1. Modify parser to use markdown handler
2. Replace `Markdown` and `Text` nodes with mdast nodes
3. Update renderers to handle mdast nodes
4. Update all tests

**Breaking changes:**
- AST structure changes completely
- `node.type === "Markdown"` no longer works
- Custom renderers need updates

**Migration guide for users:**
```javascript
// Before (v0.x)
if (node.type === 'Markdown') {
  console.log(node.content)
}

// After (v1.x)
import { visit } from 'unist-util-visit'

visit(tree, 'paragraph', (node) => {
  console.log(node) // Now it's an mdast paragraph
})
```

### Phase 2: Add Unified Processors

**Version: 1.1.0**

1. Create `slashdown-parse` plugin
2. Create `slashdown-stringify` plugin
3. Create `slashdown-to-html` compiler
4. Maintain backwards compatibility with existing API

**Non-breaking:** Template literal API stays the same

### Phase 3: Extract Packages

**Version: 2.0.0**

1. Split into separate packages
2. Create plugin ecosystem
3. Create CLI tool

---

## Implementation Plan

### Step 1: Add Dependencies

```bash
bun add unified mdast-util-from-markdown mdast-util-to-markdown
bun add -d @types/mdast @types/unist
```

### Step 2: Create Markdown Handler

**File:** `src/markdown-handler.ts`

```typescript
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import type { Root } from 'mdast'
import type { SD } from './types'

export interface MarkdownHandlerOptions {
  plugins?: any[]
  extensions?: any[]
}

export class MarkdownHandler {
  private options: MarkdownHandlerOptions

  constructor(options: MarkdownHandlerOptions = {}) {
    this.options = options
  }

  /**
   * Parse markdown string to mdast nodes
   */
  parse(markdown: string, position?: SD.Position): Root {
    const tree = fromMarkdown(markdown, {
      extensions: [gfm(), ...(this.options.extensions || [])],
      mdastExtensions: [gfmFromMarkdown(), ...(this.options.plugins || [])]
    })

    // Attach position if provided
    if (position) {
      tree.position = position
    }

    return tree
  }
}
```

### Step 3: Modify Parser

**File:** `src/parser.ts`

```typescript
import { MarkdownHandler } from './markdown-handler'
import type { Content as MdastContent } from 'mdast'

export class Parser {
  private markdownHandler: MarkdownHandler

  constructor(
    tokens: SD.Token[] = [],
    markdownOptions?: MarkdownHandlerOptions
  ) {
    this.tokens = tokens
    this.tree = []
    this.cursor = 0
    this.markdownHandler = new MarkdownHandler(markdownOptions)
  }

  private parseMarkdown(token: SD.Token): MdastContent[] {
    const position = this.createPosition(token)
    const mdast = this.markdownHandler.parse(token.content, position)

    // Return the children of the root node
    // (we don't want the root wrapper)
    return mdast.children
  }

  private parseTag(startTag: SD.Token): SD.TagNode {
    // ... existing code ...

    switch (token.type) {
      case "Markdown":
      case "CodeFence":
        // Parse markdown → mdast and add children
        const mdastNodes = this.parseMarkdown(token)
        tag.children.push(...mdastNodes)  // Spread mdast nodes!
        break

      // ... rest of code ...
    }
  }
}
```

### Step 4: Update Type Definitions

**File:** `src/types.d.ts`

```typescript
import type { Node as UnistNode, Position, Point } from 'unist'
import type { Content as MdastContent, Root as MdastRoot } from 'mdast'

export declare namespace SD {
  // Tokens (unchanged)
  type Token = {
    type: TokenType
    content: string
    indent: number
    line: number
    column: number
    endLine?: number
    endColumn?: number
  }

  // Position types (from unist)
  export type { Point, Position }

  // SlashDown-specific nodes
  interface SlashDownTag extends UnistNode {
    type: 'slashdownTag'
    tagName: string
    attributes?: Record<string, string | boolean>
    classes?: string[]
    ids?: string[]
    children: (SlashDownTag | MdastContent)[]
  }

  interface Root extends UnistNode {
    type: 'root'
    children: (SlashDownTag | MdastContent)[]
  }

  // Main AST type
  type Ast = Root

  // Renderer interface (updated)
  interface Renderer {
    render(input: Ast): string
  }
}
```

### Step 5: Update HTML Renderer

**File:** `src/renderers/html.ts`

```typescript
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'

export default class HTMLRenderer implements SD.Renderer {
  render(ast: SD.Ast): string {
    return ast.children.map(this.renderNode).join('')
  }

  private renderNode = (node: SD.SlashDownTag | MdastContent): string => {
    if (node.type === 'slashdownTag') {
      return this.renderTag(node)
    } else {
      // It's an mdast node - convert to hast then HTML
      const hast = toHast(node)
      return toHtml(hast)
    }
  }

  private renderTag(node: SD.SlashDownTag): string {
    const attributes = this.unpackAttributes(node)
    const children = node.children.map(this.renderNode).join('')
    return `<${node.tagName}${attributes}>${children}</${node.tagName}>`
  }

  // ... rest of code ...
}
```

### Step 6: Create Unified Processor

**File:** `src/processors/parse.ts`

```typescript
import type { Processor } from 'unified'
import { Lexer } from '../lexer'
import { Parser } from '../parser'

export interface SlashdownParseOptions {
  mdast?: MarkdownHandlerOptions
}

/**
 * Plugin to parse SlashDown input into a slast tree
 */
export default function slashdownParse(
  this: Processor,
  options: SlashdownParseOptions = {}
): void {
  const parser = (doc: string) => {
    const lexer = new Lexer(doc)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens, options.mdast)
    return parser.ast()
  }

  // Attach parser to unified processor
  this.Parser = parser
}
```

---

## Benefits of This Architecture

### ✅ Unified Ecosystem Integration
- Use `unist-util-visit` to traverse the tree
- Apply remark plugins to markdown content
- Use rehype for HTML transformations

### ✅ Better Developer Experience
```javascript
import { visit } from 'unist-util-visit'

// Find all headings (works seamlessly!)
visit(tree, 'heading', (node) => {
  console.log(node.depth, node.children)
})

// Find all SlashDown tags
visit(tree, 'slashdownTag', (node) => {
  console.log(node.tagName, node.classes)
})
```

### ✅ Plugin Compatibility
```javascript
// Apply remark plugins to markdown content
unified()
  .use(slashdownParse, {
    mdast: {
      plugins: [remarkGfm, remarkToc, remarkFootnotes]
    }
  })
```

### ✅ JSX Support (Future)
```javascript
// Swap markdown handler for MDX handler
unified()
  .use(slashdownParse, {
    mdast: {
      parser: remarkMdx  // Parse as MDX instead!
    }
  })
```

---

## Questions to Resolve

1. **Node naming:** Should SlashDown tags be `slashdownTag` or just `tag`?
   - **Recommendation:** `slashdownTag` to avoid conflicts with HTML `tag` nodes

2. **Text nodes:** Should inline text (`= Hello`) become mdast `text` nodes or stay as custom nodes?
   - **Recommendation:** Convert to mdast `text` nodes for consistency

3. **Root node:** Should the AST be wrapped in a `root` node like mdast?
   - **Recommendation:** Yes, for unified compatibility

4. **Backwards compatibility:** Should we keep v0.x API alongside v1.x?
   - **Recommendation:** No, clean break with migration guide

5. **Package structure:** Monorepo or single package first?
   - **Recommendation:** Single package (v1.x), split later (v2.x)

---

## Next Steps

1. **Review this architecture** - Does it align with your vision?
2. **Decide on breaking changes** - Are we ready for v1.0.0?
3. **Choose migration path** - Gradual or all-at-once?
4. **Start implementation** - Begin with markdown handler
