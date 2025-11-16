# Node Type Decision: `element` vs `element` vs tag name

## The Question

Should Slashdown nodes use:
1. **Generic type + tagName**: `{ type: 'element', tagName: 'div' }` (current)
2. **HAST-compatible**: `{ type: 'element', tagName: 'div' }`
3. **Tag name as type**: `{ type: 'div' }`

## Comparison with Other Specs

### HAST (HTML AST)
```javascript
{
  type: 'element',        // ← All HTML elements use this
  tagName: 'div',         // ← Specific element
  properties: {           // ← Attributes as camelCase properties
    className: ['container'],
    id: 'main'
  },
  children: [...]
}
```

**Key insight**: HAST uses `type: 'element'` because **all HTML elements have the same shape** - they all have tagName, properties, and children.

### MDAST (Markdown AST)
```javascript
// Different types have different shapes
{ type: 'heading', depth: 1, children: [...] }    // has depth
{ type: 'code', lang: 'js', value: '...' }        // has lang, value
{ type: 'paragraph', children: [...] }            // just children
{ type: 'text', value: '...' }                    // has value
```

**Key insight**: MDAST uses **specific types** because markdown constructs have **different properties**.

### Current Slashdown
```javascript
{
  type: 'element',   // ← All Slashdown tags use this
  tagName: 'div',         // ← Specific element
  classes: ['container'], // ← Our custom format
  ids: ['main'],
  attributes: {...},
  children: [...]
}
```

## Options Analysis

### Option 1: Keep `type: 'element'` (Current) ✅

**Pros:**
- Clear distinction between Slashdown nodes and mdast/hast nodes
- Can use `visit(tree, 'element', ...)` to find all Slashdown tags
- Maintains our ergonomic `classes` and `ids` arrays
- Easy to convert to hast when needed

**Cons:**
- Not directly compatible with hast
- Extra conversion step needed for HTML output

**Example:**
```javascript
import { visit } from 'unist-util-visit'

// Find all Slashdown tags
visit(tree, 'element', (node) => {
  if (node.tagName === 'button') {
    // Do something with buttons
  }
})

// Find all headings (mdast)
visit(tree, 'heading', (node) => {
  // Do something with headings
})
```

---

### Option 2: Use `type: 'element'` (HAST-compatible)

**Pros:**
- Direct compatibility with hast
- Easier integration with rehype ecosystem
- Could use hast utilities directly

**Cons:**
- Ambiguity: Is it hast or Slashdown?
- Our `classes`/`ids` arrays conflict with hast's `properties` format
- Would need to convert to hast properties structure

**Example:**
```javascript
{
  type: 'element',
  tagName: 'div',
  properties: {
    className: ['container'],  // hast format
    id: 'main'
  },
  children: [...]
}
```

**Problem:** We'd lose our ergonomic `classes` and `ids` arrays!

---

### Option 3: Use tag name as type (e.g., `type: 'div'`)

**Pros:**
- Very specific node types
- Similar to mdast's approach

**Cons:**
- Conflicts with potential mdast extensions
- Can't distinguish Slashdown tags from other nodes
- TypeScript would need to know all HTML tag names
- Can't use `visit(tree, 'div', ...)` to find just Slashdown divs

**Example:**
```javascript
{
  type: 'div',       // ← What if mdast adds a 'div' extension?
  classes: [...],
  children: [...]
}
```

**Problem:** Too ambiguous in a hybrid tree!

---

## Recommendation: Keep `type: 'element'` + Add HAST Converter

### Why This Works Best

1. **Clear Semantics**: In a hybrid tree with both Slashdown and mdast nodes, we need clear distinction
2. **Ergonomic API**: Our `classes` and `ids` arrays are more ergonomic than hast's `properties`
3. **Easy Conversion**: We can convert to hast when needed for the unified pipeline

### Proposed Pipeline

```javascript
// Slashdown → HAST → HTML
element
  ↓ (slast-to-hast converter)
hast element
  ↓ (hast-to-html)
HTML string

// MDAST → HAST → HTML
mdast nodes
  ↓ (mdast-to-hast - already exists!)
hast element
  ↓ (hast-to-html)
HTML string
```

### Example Converter (Future)

```typescript
// src/transforms/slast-to-hast.ts
import type { Element as HastElement } from 'hast'
import type { SD } from './types'

export function elementToHast(node: SD.SlashdownTag): HastElement {
  return {
    type: 'element',
    tagName: node.tagName,
    properties: {
      ...(node.ids?.length ? { id: node.ids.join(' ') } : {}),
      ...(node.classes?.length ? { className: node.classes } : {}),
      ...node.attributes
    },
    children: node.children.map(child =>
      child.type === 'element'
        ? elementToHast(child)
        : mdastToHast(child)  // mdast nodes use existing converter
    )
  }
}
```

## Alternative: Could We Use `type: 'html'`?

Some unified processors use `type: 'html'` for raw HTML in markdown. But this doesn't fit because:
- We're not raw HTML, we have structure
- We want to traverse and transform our nodes
- `html` type typically has a `value` string, not `children`

## Conclusion

**Keep `type: 'element'`** because:

1. ✅ Clear semantics in hybrid AST
2. ✅ Can use unist utilities to find Slashdown vs mdast nodes
3. ✅ Maintains ergonomic `classes` and `ids` arrays
4. ✅ Easy to convert to hast when needed
5. ✅ Follows the pattern: specific type for specific structure

The current implementation is actually the right choice! We just need to add converters for full unified integration.

---

## Implementation Status

- [x] `type: 'element'` implemented
- [x] Hybrid AST with mdast nodes
- [ ] `slast-to-hast` converter (future)
- [ ] `hast-to-slast` converter (future)
- [ ] Full unified processor pipeline (future)
