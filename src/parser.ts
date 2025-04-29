import type { SD } from "./types"

const INDENTATION_IMMUNE_TOKENS: Partial<SD.TokenType>[] = ["Attribute", "Id", "Class", "Text"];
const isNonIndenting = ( tokenType: SD.TokenType ): boolean => INDENTATION_IMMUNE_TOKENS.includes( tokenType )

export class Parser {
  tokens: SD.Token[]
  private tree: SD.Node[]
  private cursor: number

  constructor( tokens: SD.Token[] = [] ) {
    this.tokens = tokens
    this.tree = []
    this.cursor = 0
  }

  ast() {
    if (this.tree.length)
      return this.tree;
    else {
      return this.parse();
    }
  }

  parse( tokens: SD.Token[] = this.tokens ): any[] {
    // reset instance
    this.tokens = tokens;
    this.tree = [];

    // Top loop
    while (this.remaining()) {
      const token: SD.Token = this.consumeNext();

      switch (token.type) {
        case "Tag":
          const tag = this.parseTag(token)
          this.tree.push(tag);
          break;
        case "Markdown":
        case "CodeFence": // CodeFences *are* markdown
          this.tree.push(this.parseMarkdown(token));
          break;

        // Top level items should only be Tags or Markdown
        default:
          console.error(token)
          throw new Error(`Parse Error: Unexpected root level token`);
      }
    }

    return this.tree;
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

  private parseTag(startTag: SD.Token): SD.TagNode {
    let tagName = startTag.content;

    // handle `/` shorthand
    // TODO: Maybe move this to a rendering strategy or options object to set a "default" component
    tagName = tagName === "" ? "div" : tagName;

    const tag: SD.TagNode = {
      type: "Tag",
      tagName,
      children: []
    };

    while (this.remaining()) {
      const nextToken = this.lookahead();
      const isChild = nextToken.indent > startTag.indent;

      if (isChild || isNonIndenting(nextToken.type)) {
        const token = this.consumeNext();
        switch (token.type) {
          case "Markdown":
          case "CodeFence":
            tag.children.push(this.parseMarkdown(token));
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
            tag.children.push({
              type: "Text",
              content: token.content
            });
            break;
        }
      } else {
        break; // exit the loop
      }
    }

    return tag;
  }

  private parseMarkdown(token: SD.Token):  SD.MarkdownNode {
    return {
      type: "Markdown",
      content: token.content
    };
  }
}