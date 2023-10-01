import { describe, expect, test } from 'vitest'

import type { SD } from "../src/types";
import { dedent } from "./utils"
import { Lexer } from '../src/lexer'
import { Parser } from '../src/parser'
import HTMLRenderer from "../src/renderers/html";

const lexer = new Lexer()
const parser = new Parser()
const renderer = new HTMLRenderer()

function src(strings: TemplateStringsArray, ...values: any[]) {
  return dedent(strings, values);
}

function match(
  src: string,
  expectedTokens: SD.Token[] = [],
  expectedAst: SD.Node[] = [],
  expectedHtml: string = ""
) {
  if( src && expectedTokens.length ) {
    const tokens = lexer.tokens(src);
    expect( tokens ).toStrictEqual( expectedTokens );

    if(expectedAst.length) {
      const ast = parser.parse(tokens);
      expect( ast ).toStrictEqual( expectedAst );

      if( expectedHtml.length ) {
        expect( renderer.render(ast) ).toBe( expectedHtml )
      }
    }
  }
}


test("codefence", () => {
  const source: string = src`
      / .container

        # This is a codefence

        \`\`\`sd
        / this should be verbatim
        \`\`\`
    `

    const tokens: SD.Token[] = [
      { type: "Tag",       content: "",                                     indent: 0 },
      { type: "Class",     content: "container",                               indent: 0 },
      { type: "Markdown",  content: "# This is a codefence",                   indent: 2 },
      { type: "CodeFence", content: "```sd\n/ this should be verbatim\n```",   indent: 2 },
    ];

    const ast: SD.Node[] = [
      { type: "Tag",
        tagName: "div",
        classes: ["container"],
        children: [
          { type: "Markdown", content: "# This is a codefence" },
          { type: "Markdown", content: "```sd\n/ this should be verbatim\n```" },
        ]
      }
    ]

  match(source, tokens, ast)
})


describe("syntax combos", () => {
  test("immediate markdown, followed by a tag with attributes and innerText, no blank lines", () => {
    const source: string = src`
      /footer .flex.justify-between
        Made with ❤️ in slashdown
        /a href="https://miniware.team?ref=slashdown" target="_blank" = by Miniware
    `

    const tokens: SD.Token[] = [
      { type: "Tag",       content: "footer",                                     indent: 0 },
      { type: "Class",     content: "flex",                                        indent: 0 },
      { type: "Class",     content: "justify-between",                            indent: 0 },
      { type: "Markdown",  content: "Made with ❤️ in slashdown",                   indent: 2 },
      { type: "Tag",       content: "a",                                          indent: 2 },
      { type: "Attribute", content: 'href="https://miniware.team?ref=slashdown"', indent: 2 },
      { type: "Attribute", content: 'target="_blank"',                            indent: 2 },
      { type: "Text",      content: "by Miniware",                                indent: 2 },
    ];

    match( source, tokens )
  })
})