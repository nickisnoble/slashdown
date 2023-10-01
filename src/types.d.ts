const TOKEN_TYPES = [
  "Tag",
  "Attribute",
  "Id",
  "Class",
  "Text",
  "Markdown",
  "CodeFence"
] as const;
const NODE_TYPES = ["Tag", "Text", "Markdown"] as const;

export declare namespace SD {
  // Tokens
  type TokenType = typeof TOKEN_TYPES[number];
  type Token = {
    type: TokenType,
    content: string,
    indent: number,
  }

  // Nodes
  type Node = {
    type: NodeType,
    [key: string]: any
  }

  type TextNode = Node & {
    content: string,
  }

  type MarkdownNode = TextNode

  type TagNode = Node & {
    tagName: string,
    attributes?: { [key: string]: string | boolean },
    classes?: string[],
    ids?: string[],
    children: Node[]
  }

  type Ast = Node[]

  interface Renderer {
    render(input: Ast): string;
  }
}