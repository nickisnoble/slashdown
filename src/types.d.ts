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
  type NodeType = typeof NODE_TYPES[number];

  type Node = {
    type: NodeType,
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

  // Configuration options
  interface SlashdownOptions {
    src?: string;
    renderer?: new(options?: RendererOptions) => Renderer;
    defaultTag?: string;
    maxDepth?: number;
  }

  interface RendererOptions {
    escapeHtml?: boolean;
  }
}

// Re-export types for external use
export type { SD }