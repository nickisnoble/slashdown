import { expect, test, describe, vi } from 'vitest'
import { createSlashdown, Slashdown } from "../src/slashdown";
import { dedent } from './utils';
import JSONRenderer from '../src/renderers/json';
import HTMLRenderer from '../src/renderers/html';

test( "it works", ()=> {
  const src = dedent`
    //  Welcome to slashdown!
    //  A superset of markdown for quickly creating web pages.
    //  Plays *very* well with: HTMX, Tailwind, AlpineJS, and the backend of your choice.

    // This is a comment. It will not be rendered in the output.

    /main .container.mx-auto
      // Any line starting with a / is a tag, unless it's a comment.
      // You can add classes and ids to tags via the usual shorthands (e.g. .class #id)
      // You can also add attributes the normal way! (e.g. href="https://example.com" )

      // Anything not starting with a / is a child of the previous tag, and will be rendered as markdown
      // Indentation is important! It determines the parent/child relationship of tags.

      # This is a heading. It will be rendered as an h1 tag.

      It's the child of the section element above it.

      / .grid.grid-col-2
        data-foo="bar"

        This will render as a paragraph.

        And this will render as a paragraph too.

        // Boolean attributes are supported too!
        /input type="text" placeholder="Enter your name" autofocus

        // An empty tag will be rendered as a <div> tag.
        // And items on the immediate next line after a tag, if indented, will be parsed as attributes.

      // Items at the same indent level become siblings.
      /footer .flex.justify-between
        Made with ❤️ by slashdown.

        // Plaintext can be easily added with " = " at the end of a tag
        /a href="https://miniware.team" target="_blank" = Made by Miniware
  `
  const slashdown = new Slashdown()
  expect( slashdown.process(src) ).toBeTypeOf("string");
})

describe("renderers", ()=> {
  const src = "/ .container = Hello World!"

  test("JSONRenderer produces valid JSON", () => {
    const renderer = JSONRenderer;
    const slashdown = new Slashdown({src, renderer})
    const expected = '[{"type":"Tag","tagName":"div","children":[{"type":"Text","content":"Hello World!"}],"classes":["container"]}]';

    expect( slashdown.process() ).toBe( expected )
    expect( JSON.parse( slashdown.process() )).toStrictEqual( JSON.parse(expected) )
  })

  test("HTMLRenderer produces valid HTML", () => {
    const renderer = HTMLRenderer;
    const slashdown = new Slashdown({src, renderer})
    const expected = '<div class="container">Hello World!</div>';
    expect( slashdown.process() ).toBe( expected )
  })

  test("Default renderer is HTML", () => {
    const slashdown = new Slashdown()
    const expected = '<div class="container">Hello World!</div>';
    expect( slashdown.process(src) ).toBe( expected )
  })
})

describe("shorthand", () => {
  test("it works", () => {
    const sd = createSlashdown();
    const rendered = sd`/ .container = Hello World!`
    const expected = '<div class="container">Hello World!</div>';
    expect( rendered ).toBe( expected )
  })

  test("it can be configured", () => {
    const sd = createSlashdown({
      renderer: JSONRenderer
    });
    const rendered = sd`/ .container = Hello World!`
    const expected = '[{"type":"Tag","tagName":"div","children":[{"type":"Text","content":"Hello World!"}],"classes":["container"]}]';
    expect( rendered ).toBe( expected )
  })
})