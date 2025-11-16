import { expect, test, describe } from 'vitest'
import type { Root as MdastRoot } from 'mdast'
import { Lexer } from '../src/lexer'
import { Parser } from '../src/parser'
import { dedent } from './utils'

/**
 * Tests for hybrid AST structure
 *
 * The new architecture should:
 * 1. Parse markdown content into mdast nodes (not strings)
 * 2. Have element nodes that contain mdast children
 * 3. Wrap everything in a root node
 * 4. Support unist utilities for traversal
 */

describe('Hybrid AST Structure', () => {
  test('markdown becomes mdast nodes, not strings', () => {
    const src = dedent`
      # Hello World

      This is a **paragraph**.
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    // Should have a root node
    expect(ast.type).toBe('root')
    expect(ast.children).toBeInstanceOf(Array)

    // First child should be an mdast heading
    const heading = ast.children[0]
    expect(heading.type).toBe('heading')
    expect(heading.depth).toBe(1)
    expect(heading.children).toHaveLength(1)
    expect(heading.children[0].type).toBe('text')
    expect(heading.children[0].value).toBe('Hello World')

    // Second child should be an mdast paragraph
    const paragraph = ast.children[1]
    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children).toHaveLength(3) // "This is a ", <strong>, "."
    expect(paragraph.children[0].type).toBe('text')
    expect(paragraph.children[0].value).toBe('This is a ')
    expect(paragraph.children[1].type).toBe('strong')
    expect(paragraph.children[1].children[0].value).toBe('paragraph')
  })

  test('slashdown tags contain mdast children', () => {
    const src = dedent`
      /article .prose
        # My Post

        This is content.
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    expect(ast.type).toBe('root')

    // First child should be an element
    const article = ast.children[0]
    expect(article.type).toBe('element')
    expect(article.tagName).toBe('article')
    expect(article.classes).toEqual(['prose'])

    // Article's children should be mdast nodes
    expect(article.children).toHaveLength(2) // heading + paragraph

    const heading = article.children[0]
    expect(heading.type).toBe('heading')
    expect(heading.depth).toBe(1)

    const paragraph = article.children[1]
    expect(paragraph.type).toBe('paragraph')
  })

  test('nested slashdown tags work correctly', () => {
    const src = dedent`
      /main
        /section
          # Heading
        /footer
          Made with ❤️
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    const main = ast.children[0]
    expect(main.type).toBe('element')
    expect(main.tagName).toBe('main')
    expect(main.children).toHaveLength(2) // section + footer

    const section = main.children[0]
    expect(section.type).toBe('element')
    expect(section.tagName).toBe('section')
    expect(section.children).toHaveLength(1)
    expect(section.children[0].type).toBe('heading')

    const footer = main.children[1]
    expect(footer.type).toBe('element')
    expect(footer.tagName).toBe('footer')
    expect(footer.children).toHaveLength(1)
    expect(footer.children[0].type).toBe('paragraph')
  })

  test('inline text (= syntax) becomes mdast text node', () => {
    const src = '/button = Click me!'

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    const button = ast.children[0]
    expect(button.type).toBe('element')
    expect(button.tagName).toBe('button')
    expect(button.children).toHaveLength(1)

    // Should be an mdast text node, not a custom TextNode
    const text = button.children[0]
    expect(text.type).toBe('text')
    expect(text.value).toBe('Click me!')
  })

  test('code fences become mdast code nodes', () => {
    const src = dedent`
      \`\`\`javascript
      const x = 1;
      \`\`\`
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    expect(ast.children).toHaveLength(1)

    const code = ast.children[0]
    expect(code.type).toBe('code')
    expect(code.lang).toBe('javascript')
    expect(code.value).toBe('const x = 1;')
  })

  test('mixed content: tags and markdown at same level', () => {
    const src = dedent`
      # Introduction

      /button
        Click me

      More text here.
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    expect(ast.children).toHaveLength(3)

    // First: heading
    expect(ast.children[0].type).toBe('heading')

    // Second: element
    expect(ast.children[1].type).toBe('element')
    expect(ast.children[1].tagName).toBe('button')

    // Third: paragraph
    expect(ast.children[2].type).toBe('paragraph')
  })

  test('preserves position information', () => {
    const src = dedent`
      /article
        # Hello
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    // Root should have position
    expect(ast.position).toBeDefined()

    // Article tag should have position
    const article = ast.children[0]
    expect(article.position).toBeDefined()
    expect(article.position.start.line).toBe(1)

    // Heading should have position
    const heading = article.children[0]
    expect(heading.position).toBeDefined()
    expect(heading.position.start.line).toBe(2)
  })

  test('attributes, classes, and ids still work', () => {
    const src = '/button #submit.primary.large disabled = Submit'

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    const button = ast.children[0]
    expect(button.type).toBe('element')
    expect(button.tagName).toBe('button')
    expect(button.ids).toEqual(['submit'])
    expect(button.classes).toEqual(['primary', 'large'])
    expect(button.attributes).toEqual({ disabled: true })
    expect(button.children[0].type).toBe('text')
    expect(button.children[0].value).toBe('Submit')
  })

  test('GFM features work (tables, strikethrough, etc.)', () => {
    const src = dedent`
      | Feature | Status |
      |---------|--------|
      | Tables  | ✅     |

      ~~Deprecated~~
    `

    const lexer = new Lexer(src)
    const tokens = lexer.tokens()
    const parser = new Parser(tokens)
    const ast = parser.ast()

    // Should parse GFM table
    const table = ast.children[0]
    expect(table.type).toBe('table')
    expect(table.children).toHaveLength(2) // header + body row

    // Should parse strikethrough
    const paragraph = ast.children[1]
    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children[0].type).toBe('delete')
    expect(paragraph.children[0].children[0].value).toBe('Deprecated')
  })
})
