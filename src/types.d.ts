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
    line: number,
    column: number,
    endLine?: number,
    endColumn?: number,
  }

  // Unist-compatible position types
  type Point = {
    line: number,      // 1-indexed line number
    column: number,    // 1-indexed column number
    offset?: number,   // 0-indexed character offset (optional)
  }

  type Position = {
    start: Point,
    end: Point,
  }

  // Base Node type conforming to unist spec
  type NodeType = typeof NODE_TYPES[number];
  type Node = {
    type: NodeType,
    position?: Position,  // Optional position info (unist spec)
    data?: any,           // Optional ecosystem-specific data (unist spec)
    [key: string]: any
  }

  type TextNode = Node & {
    type: "Text",
    content: string,
  }

  type MarkdownNode = Node & {
    type: "Markdown",
    content: string,
  }

  type TagNode = Node & {
    type: "Tag",
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