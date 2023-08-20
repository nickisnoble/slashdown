import { expect, test } from 'vitest'
import { type Token, Lexer } from '../src/lexer'
import { dedent } from "./utils"

test('it works', () => {
  const src = dedent`
    Hello
    world
  `;
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toBeInstanceOf(Array)
  expect(tokens).toHaveLength(1)
  expect(tokens[0].type).toBe("Markdown")
})

test('can lex a simple tag', () => {
  const src = `/div`
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()

  const expected: Token[] = [
    {
      type: "Tag",
      content: "div",
      indent: 0
    }
  ]

  expect(tokens).toEqual( expected )
})

test('can lex a blank tag with a class', () => {
  const src = "/ .my-class";
  const lexer = new Lexer(src);
  const tokens = lexer.tokens();
  expect(tokens).toEqual([
    { type: 'Tag', content: '', indent: 0 },
    { type: 'Class', content: 'my-class', indent: 0 }
  ])
})

test('can lex multiple chained selectors', () => {
  const src = "/section #hero.grid"
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toEqual([
    { type: 'Tag', content: 'section', indent: 0 },
    { type: 'Id', content: 'hero', indent: 0 },
    { type: 'Class', content: 'grid', indent: 0 }
  ])
})

test('attributes work', () => {
  const src = '/div data-foo="bar baz"'
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toEqual([
    { type: 'Tag', content: 'div', indent: 0 },
    { type: 'Attribute', content: 'data-foo="bar baz"', indent: 0 }
  ])
})

test('can have both classes and attributes', () => {
  const src = '/div .my-class data-foo="bar baz"'
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toEqual([
    { type: 'Tag', content: 'div', indent: 0 },
    { type: 'Class', content: 'my-class', indent: 0 },
    { type: 'Attribute', content: 'data-foo="bar baz"', indent: 0 }
  ])
})

test('can lex attributes on a new line', () => {
const src = dedent`
  /div
    data-foo="bar baz"
    This is content
`
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toEqual([
    { type: 'Tag', content: 'div', indent: 0 },
    { type: 'Attribute', content: 'data-foo="bar baz"', indent: 0 },
    { type: 'Markdown', content: 'This is content', indent: 2 }
  ])
})

test('lexes indentation and nested items properly', () => {
  const src = dedent`
    /ul .list
      /li
    // This is a comment which should be ignored
      /li
        data-foo="bar baz"
        /span
    /footer

      This is outdented content
  `

  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toEqual([
    { type: 'Tag', content: 'ul', indent: 0 },
    { type: 'Class', content: 'list', indent: 0 },
    { type: 'Tag', content: 'li', indent: 2 },
    { type: 'Tag', content: 'li', indent: 2 },
    { type: 'Attribute', content: 'data-foo="bar baz"', indent: 2 },
    { type: 'Tag', content: 'span', indent: 4 },
    { type: 'Tag', content: 'footer', indent: 0 },
    { type: 'Markdown', content: 'This is outdented content', indent: 2 }
  ])
})

test('can lex a tag with attributes and text content', () => {
  const src = `/div data-foo="bar baz" autofocus = This is text`
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()
  expect(tokens).toEqual([
    { type: 'Tag', content: 'div', indent: 0 },
    { type: 'Attribute', content: 'data-foo="bar baz"', indent: 0 },
    { type: 'Attribute', content: 'autofocus', indent: 0 },
    { type: 'Text', content: 'This is text', indent: 0 }
  ])
})


test('can lex long markdown blocks, with code fences', () => {
  const src = dedent`
    # This is a markdown block

    Here is some text.
    - and
    - a
    - list

    More text here.
  `;
  const lexer = new Lexer(src)
  const tokens = lexer.tokens()

  console.info(src)
  console.info(tokens)

  expect(tokens).toEqual([
    { type: 'Markdown', content: src, indent: 0 },
  ])
})
