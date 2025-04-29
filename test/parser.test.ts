import { expect, test, describe, vi } from 'vitest'
import type { SD } from '../src/types'
import { Parser } from "../src/parser"
import { dedent } from './utils'

test('parser returns an array when given valid input', () => {
  const tokens: SD.Token[] = [
    { type: 'Tag', content: 'div', indent: 0 },
  ]

  const ast = new Parser( tokens ).ast();
  expect( ast.length ).toBe(1)
})

test('parser rejects unexpected top level token', () => {
  const tokens: SD.Token[] = [
    { type: 'Attribute', content: 'autofocus', indent: 0 },
    { type: 'Tag', content: 'input', indent: 0 },
  ]

  expect(() => {
    const ast = new Parser( tokens ).ast();
  }).toThrow("Parse Error: Unexpected root level token");
})

test("ast() method only runs once", ()=> {
  const tokens: SD.Token[] = [
    { type: 'Tag', content: 'div', indent: 0 },
    { type: 'Text', content: 'Hello world!', indent: 0 },
  ];

  const parser = new Parser(tokens)

  // Spy on the parse method
  const spy = vi.spyOn(parser, 'parse')

  // Call ast multiple times
  parser.ast()
  parser.ast()
  parser.ast()

  // Assert that parse was called only once
  expect(spy).toHaveBeenCalledTimes(1)
})

test("markdown only", ()=>{
  const ast = new Parser( [{
    type: 'Markdown',
    content: dedent`
      # This is a markdown block

      Here is some text.
      - and
      - a
      - list

      More text here.
    `,
    indent: 2
  }] ).ast();

  expect( ast ).toStrictEqual([
    {
      type: 'Markdown',
      content: dedent`
        # This is a markdown block

        Here is some text.
        - and
        - a
        - list

        More text here.
      `
    }
  ])
})

describe("Tag properties", ()=> {
  test('Parser coerces blank tags to divs', () => {
    const blankTagToken: SD.Token = { type: "Tag", content: "", indent: 0 }
    const firstNode = new Parser( [blankTagToken] ).ast()[0]

    expect(firstNode.tagName).toBe("div");
  })

  test('classes and ids', () => {
    const tokens: SD.Token[] = [
      { type: "Tag", content: "header", indent: 0 },
      { type: "Class", content: "font-lg", indent: 0 },
      { type: "Id", content: "header", indent: 0 },
      { type: "Class", content: "bg-red-500", indent: 0 },
    ]

    const tagNode = new Parser( tokens ).ast()[0]

    expect( tagNode.tagName ).toBe("header")
    expect( tagNode.classes ).toStrictEqual(["font-lg", "bg-red-500"])
    expect( tagNode.ids ).toStrictEqual(["header"])
  })

  test('regular attributes', () => {
    const tokens: SD.Token[] = [
      { type: "Tag", content: "input", indent: 0 },
      { type: "Attribute", content: "data-foo='bar'", indent: 0 },
      { type: "Attribute", content: 'type="text"', indent: 0 },
    ]

    const tagNode = new Parser( tokens ).ast()[0]

    expect( tagNode.attributes ).toStrictEqual({
      "data-foo": "bar",
      type: "text"
    })
  })

  test('boolean attributes', () => {
    const tokens: SD.Token[] = [
      { type: "Tag", content: "input", indent: 0 },
      { type: "Attribute", content: "autofocus", indent: 0 },
    ]

    const tagNode = new Parser( tokens ).ast()[0]

    expect( tagNode.attributes ).toStrictEqual({
      autofocus: true
    })
  })
})

describe('longer doc', () => {
  const tokens: SD.Token[] = [
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
    expect(h1.type).toBe('Tag')
    expect(h1.tagName).toBe('h1')
    expect(h1.children.length).toBe(1)
  })
})