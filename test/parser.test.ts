import { expect, test, describe } from 'vitest'
import type { Slashdown } from '../src/types'
import { Parser } from "../src/parser"

test('parser returns an array when given valid input', () => {
  const tokens: Slashdown.Token[] = [
    { type: 'Tag', content: 'div', indent: 0 },
  ]

  const ast = new Parser( tokens ).ast();
  expect( ast.length ).toBe(1)
})

test('Parser coerces blank tags to divs', () => {
  const blankTagToken: Slashdown.Token = { type: "Tag", content: "", indent: 0 }
  const firstNode = new Parser( [blankTagToken] ).ast()[0]

  console.log(new Parser( [blankTagToken] ).ast())

  expect(firstNode.tagName).toBe("div");
})

describe('with children', () => {
  const tokens: Slashdown.Token[] = [
    { type: 'Tag', content: 'section', indent: 0 },
      { type: 'Attribute', content: "foo='bar'", indent: 0 },

      { type: 'Tag', content: 'h1', indent: 1 },
        { type: 'Text', content: 'Hello World!', indent: 2 },

      { type: 'Markdown', content: 'This is content', indent: 1 },

      { type: 'Tag', content: '', indent: 1 },
        { type: 'Markdown', content: 'This is more content', indent: 2 },
        { type: 'Tag', content: 'a', indent: 2 },
          { type: 'Attribute', content: "href='http://example.com'", indent: 3 },
          { type: 'Text', content: 'Click here', indent: 3 },

    { type: 'Tag', content: 'footer', indent: 0 },
      { type: 'Text', content: 'Goodnight Moon.', indent: 1 }
  ]

  const ast = new Parser(tokens).ast()

  test('correctly manages hierarchy and children', () => {
    expect(ast.length).toBe(2)

    const section = ast[0]
    const footer = ast[1]

    // Section
    expect(section.tagName).toBe('section')
    expect(section.attributes["foo"]).toBe("bar")
    expect(section.children.length).toBe(3)

    // Footer
    expect(footer.tagName).toBe('footer')
    expect(footer.children.length).toBe(1)
    expect(footer.children[0].content).toBe('Goodnight Moon.')

    const h1 = section.children[0]
    const md = section.children[1]
    expect(h1.type).toBe('Tag')
    expect(h1.tagName).toBe('h1')
    expect(h1.children.length).toBe(1)
  })
})