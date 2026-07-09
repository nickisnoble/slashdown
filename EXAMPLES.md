# Slashdown Transformation Examples

This document shows how Slashdown integrates with the unified ecosystem for various transformations.

## Table of Contents

- [slashdown → HTML](#slashdown--html)
- [slashdown → Markdown](#slashdown--markdown)
- [markdown → slashdown](#markdown--slashdown)
- [slashdown → slashdown (transforms)](#slashdown--slashdown-transforms)
- [Hybrid: slashdown + markdown → HTML](#hybrid-slashdown--markdown--html)

---

## slashdown → HTML

**Use case:** Compile Slashdown to HTML for web deployment

```javascript
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import slashdownToHtml from 'slashdown-to-html'

const file = await unified()
  .use(slashdownParse)
  .use(slashdownToHtml)
  .process(`
/main .container
  # Hello World

  /button #cta.primary
    Click me!
  `)

console.log(String(file))
```

**Output:**
```html
<main class="container">
  <h1>Hello World</h1>
  <button id="cta" class="primary">Click me!</button>
</main>
```

---

## slashdown → Markdown

**Use case:** Extract just the markdown content from Slashdown

```javascript
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import slashdownToMarkdown from 'slashdown-to-markdown'

const file = await unified()
  .use(slashdownParse)
  .use(slashdownToMarkdown)
  .process(`
/article
  # My Blog Post

  This is **important** content.

  /footer
    Made with ❤️
  `)

console.log(String(file))
```

**Output:**
```markdown
# My Blog Post

This is **important** content.

Made with ❤️
```

---

## markdown → slashdown

**Use case:** Wrap existing markdown in Slashdown structure

```javascript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkToSlashdown from 'remark-to-slashdown'
import slashdownStringify from 'slashdown-stringify'

const file = await unified()
  .use(remarkParse)
  .use(remarkToSlashdown, {
    wrapper: { tag: 'article', classes: ['prose'] }
  })
  .use(slashdownStringify)
  .process(`
# Hello World

This is markdown content.
  `)

console.log(String(file))
```

**Output:**
```
/article .prose
  # Hello World

  This is markdown content.
```

---

## slashdown → slashdown (transforms)

**Use case:** Transform Slashdown AST with plugins

```javascript
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import slashdownStringify from 'slashdown-stringify'
import { visit } from 'unist-util-visit'

// Custom plugin to add ARIA labels to buttons
function addAriaLabels() {
  return (tree) => {
    visit(tree, 'Tag', (node) => {
      if (node.tagName === 'button' && !node.attributes?.['aria-label']) {
        node.attributes = node.attributes || {}
        node.attributes['aria-label'] = 'Interactive button'
      }
    })
  }
}

const file = await unified()
  .use(slashdownParse)
  .use(addAriaLabels)
  .use(slashdownStringify)
  .process(`
/button #submit
  Submit
  `)

console.log(String(file))
```

**Output:**
```
/button #submit aria-label="Interactive button"
  Submit
```

---

## Hybrid: slashdown + markdown → HTML

**Use case:** Process markdown within Slashdown using remark plugins

```javascript
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import slashdownToHtml from 'slashdown-to-html'
import remarkGfm from 'remark-gfm'
import remarkEmoji from 'remark-emoji'

const file = await unified()
  .use(slashdownParse, {
    // Configure how markdown content is processed
    mdast: {
      plugins: [
        remarkGfm,      // GitHub Flavored Markdown
        remarkEmoji     // :emoji: syntax
      ]
    }
  })
  .use(slashdownToHtml)
  .process(`
/article .prose
  # Task List :rocket:

  - [x] Implement parser
  - [ ] Add tests
  - [ ] Write docs

  /footer
    Made with :heart:
  `)

console.log(String(file))
```

**Output:**
```html
<article class="prose">
  <h1>Task List 🚀</h1>
  <ul>
    <li><input type="checkbox" checked disabled> Implement parser</li>
    <li><input type="checkbox" disabled> Add tests</li>
    <li><input type="checkbox" disabled> Write docs</li>
  </ul>
  <footer>Made with ❤️</footer>
</article>
```

---

## Advanced: Custom Content Handlers

**Use case:** Handle different content types (markdown, JSX, templates)

```javascript
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import slashdownToHtml from 'slashdown-to-html'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'

const file = await unified()
  .use(slashdownParse, {
    // Different handlers for different scenarios
    handlers: {
      // Default: parse markdown content
      markdown: remarkParse,

      // For .mdx files: parse as MDX
      mdx: () => unified().use(remarkParse).use(remarkMdx),

      // Custom: parse as template strings
      template: customTemplateParser,
    },

    // Auto-detect based on file extension or content
    detectHandler: (content, file) => {
      if (file.extname === '.mdx') return 'mdx'
      if (content.includes('{{')) return 'template'
      return 'markdown'
    }
  })
  .use(slashdownToHtml)
  .process(content)
```

---

## Template Literal API (Current)

For backwards compatibility and convenience:

```javascript
import { createSlashdown } from 'slashdown'

// Simple template literal (existing API)
const sd = createSlashdown()
const html = sd`
  /main .container
    # Hello World
`

// With unified processor (new API)
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import remarkGfm from 'remark-gfm'
import slashdownToHtml from 'slashdown-to-html'

const sdProcessor = createSlashdown({
  processor: unified()
    .use(slashdownParse, {
      mdast: { plugins: [remarkGfm] }
    })
    .use(slashdownToHtml)
})

const html = sdProcessor`
  /article
    # GitHub Flavored Markdown

    | Feature | Supported |
    |---------|-----------|
    | Tables  | ✅        |
    | Tasks   | ✅        |
`
```

---

## Configuration Examples

### Configurable Markdown Processing

```javascript
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'
import slashdownStringify from 'slashdown-stringify'

const processor = unified()
  .use(slashdownParse, {
    mdast: {
      // Pass options to the markdown parser
      parser: 'remark-parse',
      options: {
        commonmark: true  // Use CommonMark instead of GFM
      },

      // Apply plugins to markdown content
      plugins: [
        remarkGfm,
        [remarkToc, { heading: 'contents' }],
        remarkFootnotes
      ]
    }
  })
  .use(slashdownStringify)
```

### Custom Node Types

```javascript
// Extend Slashdown with custom node types
import { unified } from 'unified'
import slashdownParse from 'slashdown-parse'

const processor = unified()
  .use(slashdownParse, {
    // Register custom tag handlers
    customTags: {
      'component': (node) => {
        // Transform custom tags into components
        return {
          type: 'Component',
          name: node.attributes?.name,
          props: node.attributes,
          children: node.children
        }
      }
    }
  })
```

---

## Comparison with Other Ecosystems

### Remark Ecosystem
```javascript
// markdown → HTML
unified()
  .use(remarkParse)      // md → mdast
  .use(remarkRehype)     // mdast → hast
  .use(rehypeStringify)  // hast → html
```

### Slashdown Ecosystem
```javascript
// slashdown → HTML
unified()
  .use(slashdownParse)   // sd → slast (with mdast children)
  .use(slashdownToHtml)  // slast → html

// slashdown → markdown
unified()
  .use(slashdownParse)      // sd → slast
  .use(slashdownToMarkdown) // slast → md

// slashdown ↔ rehype (for HTML transforms)
unified()
  .use(slashdownParse)   // sd → slast
  .use(slashdownToHast)  // slast → hast
  .use(rehypePlugins)    // transform hast
  .use(hastToSlashdown)  // hast → slast
  .use(slashdownStringify) // slast → sd
```
