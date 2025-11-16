import type { SD } from "./types"
import type { Content as MdastContent } from 'mdast'
import { MarkdownHandler } from './markdown-handler'

const INDENTATION_IMMUNE_TOKENS: Partial<SD.TokenType>[] = ["Attribute", "Id", "Class", "Text"];
const isNonIndenting = ( tokenType: SD.TokenType ): boolean => INDENTATION_IMMUNE_TOKENS.includes( tokenType )

export class Parser {
  tokens: SD.Token[]
  private root: SD.Root
  private cursor: number
  private markdownHandler: MarkdownHandler

  constructor(
    tokens: SD.Token[] = [],
    markdownOptions?: SD.MarkdownHandlerOptions
  ) {
    this.tokens = tokens
    this.root = {
      type: 'root',
      children: []
    }
    this.cursor = 0
    this.markdownHandler = new MarkdownHandler(markdownOptions)
  }

  private createPosition(startToken: SD.Token, endToken?: SD.Token): SD.Position {
    const end = endToken || startToken;
    return {
      start: {
        line: startToken.line,
        column: startToken.column,
      },
      end: {
        line: end.endLine || end.line,
        column: end.endColumn || end.column,
      }
    };
  }

  ast(): SD.Ast {
    if (this.root.children.length > 0) {
      return this.root;
    } else {
      return this.parse();
    }
  }

  parse( tokens: SD.Token[] = this.tokens ): SD.Ast {
    // reset instance
    this.tokens = tokens;
    this.root = {
      type: 'root',
      children: []
    };
    this.cursor = 0;

    // Collect all tokens for position tracking
    const allTokens: SD.Token[] = []

    // Top loop
    while (this.remaining()) {
      const token: SD.Token = this.consumeNext();
      allTokens.push(token)

      switch (token.type) {
        case "Tag":
          const tag = this.parseTag(token)
          this.root.children.push(tag);
          break;
        case "Markdown":
          // Parse markdown into mdast nodes
          const mdastNodes = this.parseMarkdown(token)
          this.root.children.push(...mdastNodes);
          break;
        case "CodeFence":
          // Parse code fence into mdast code node
          const codeNode = this.parseCodeFence(token)
          this.root.children.push(codeNode);
          break;

        // Top level items should only be Tags or Markdown
        default:
          console.error(token)
          throw new Error(`Parse Error: Unexpected root level token`);
      }
    }

    // Set position on root node if we have tokens
    if (allTokens.length > 0) {
      this.root.position = this.createPosition(
        allTokens[0],
        allTokens[allTokens.length - 1]
      )
    }

    return this.root;
  }

  private remaining(): boolean {
    return this.cursor < this.tokens.length;
  }

  private lookahead(): SD.Token {
    return this.tokens[this.cursor];
  }

  private consumeNext(): SD.Token {
    const token = this.tokens[this.cursor];
    this.cursor += 1;
    return token;
  }

  private parseTag(startTag: SD.Token): SD.SlashDownTag {
    let tagName = startTag.content;

    // handle `/` shorthand
    tagName = tagName === "" ? "div" : tagName;

    const tag: SD.SlashDownTag = {
      type: "slashdownTag",
      tagName,
      children: []
    };

    let lastToken = startTag; // Track the last token for position tracking

    while (this.remaining()) {
      const nextToken = this.lookahead();
      const isChild = nextToken.indent > startTag.indent;

      if (isChild || isNonIndenting(nextToken.type)) {
        const token = this.consumeNext();
        lastToken = token; // Update last token

        switch (token.type) {
          case "Markdown":
            // Parse markdown into mdast nodes and add as children
            const mdastNodes = this.parseMarkdown(token)
            tag.children.push(...mdastNodes);
            break;

          case "CodeFence":
            // Parse code fence into mdast code node
            const codeNode = this.parseCodeFence(token)
            tag.children.push(codeNode);
            break;

          case "Tag":
            tag.children.push(this.parseTag(token));
            break;

          case "Attribute":
            if( !tag.attributes ) tag.attributes = {};

            let key: string = token.content;
            let value: boolean | string = true; // Assume no value, eg. <button disabled />
            const splitPosition = token.content.indexOf('=');

            // If it's a key=value pair, split them
            if( splitPosition !== -1 ) {
              key = token.content.substring(0, splitPosition);
              value = token.content.substring(splitPosition + 1);
              value = value?.replace(/['"]/g, "") // strip quotes
            }

            tag.attributes[key] = value;
            break;

          case "Id":
            tag.ids = [...new Set([...(tag.ids || []), token.content])]
            break;

          case "Class":
            tag.classes = [...new Set([...(tag.classes || []), token.content])]
            break;

          case "Text":
            // Parse inline text as mdast text node
            const textNode = this.markdownHandler.parseInlineText(
              token.content,
              this.createPosition(token)
            )
            tag.children.push(textNode);
            break;
        }
      } else {
        break; // exit the loop
      }
    }

    // Add position information to the tag
    tag.position = this.createPosition(startTag, lastToken);

    return tag;
  }

  private parseMarkdown(token: SD.Token): MdastContent[] {
    const position = this.createPosition(token)
    return this.markdownHandler.parse(token.content, position)
  }

  private parseCodeFence(token: SD.Token): MdastContent {
    const position = this.createPosition(token)
    return this.markdownHandler.parseCodeFence(token.content, position)
  }
}
