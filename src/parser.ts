import { Slashdown } from "./types"

const INDENTATION_IMMUNE_TOKENS: Partial<Slashdown.TokenType>[] = ["Attribute", "Id", "Class", "Text"];
const isNonIndenting = ( tokenType: Slashdown.TokenType ): boolean => INDENTATION_IMMUNE_TOKENS.includes( tokenType )

export class Parser {
  tokens: Slashdown.Token[]
  private tree: Slashdown.Node[]
  private cursor: number

  constructor( tokens: Slashdown.Token[] ) {
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

  parse( tokens: Slashdown.Token[] = this.tokens ): any[] {
    // reset instance
    this.tokens = tokens;
    this.tree = [];

    // Top loop
    while (this.remaining()) {
      const token: Slashdown.Token = this.consumeNext();

      switch (token.type) {
        case "Tag":
          const tag = this.parseTag(token)
          this.tree.push(tag);
          break;
        case "Markdown":
          this.tree.push(this.parseMarkdown(token));
          break;

        // Top level items should only be Tags or Markdown
        default:
          throw new Error("Parse Error: Unexpected root level token.");
      }

      console.info( this.tree )
    }

    return this.tree;
  }

  private remaining(): boolean {
    return this.cursor < this.tokens.length;
  }

  private lookahead(): Slashdown.Token {
    return this.tokens[this.cursor];
  }

  private consumeNext(): Slashdown.Token {
    const token = this.tokens[this.cursor];
    this.cursor += 1;
    return token;
  }

  private parseTag(startTag: Slashdown.Token): Slashdown.TagNode {
    let tagName = startTag.content;

    // handle `/` shorthand
    // TODO: Maybe move this to a rendering strategy or options object to set a "default" component
    tagName = tagName === "" ? "div" : tagName;

    const tag: Slashdown.TagNode = {
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
            tag.children.push(this.parseMarkdown(token));
            break;

          case "Tag":
            tag.children.push(this.parseTag(token));
            break;

          case "Attribute":
            let [key, value] = token.content.split('=');
            value = value
              .replace(/'|"/g, "")

            if( !tag.attributes ) tag.attributes = {};
            tag.attributes[key] = value ?? true;
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

  private parseMarkdown(token: Slashdown.Token):  Slashdown.MarkdownNode {
    return {
      type: "Markdown",
      content: token.content
    };
  }
}