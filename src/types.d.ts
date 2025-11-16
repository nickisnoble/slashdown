import type { Node as UnistNode, Position, Point } from 'unist'
import type { Content as MdastContent, Root as MdastRoot } from 'mdast'

const TOKEN_TYPES = [
  "Tag",
  "Attribute",
  "Id",
  "Class",
  "Text",
  "Markdown",
  "CodeFence"
] as const;

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

  // Re-export unist position types for convenience
  export type { Point, Position }

  // SlashDown-specific nodes

  /**
   * SlashDown tag node (like <div>, <button>, etc.)
   * Can contain both slashdown tags and mdast content as children
   */
  interface SlashDownTag extends UnistNode {
    type: 'slashdownTag'
    tagName: string
    attributes?: { [key: string]: string | boolean }
    classes?: string[]
    ids?: string[]
    children: (SlashDownTag | MdastContent)[]
    position?: Position
    data?: any
  }

  /**
   * Root node containing the entire document
   */
  interface Root extends UnistNode {
    type: 'root'
    children: (SlashDownTag | MdastContent)[]
    position?: Position
    data?: any
  }

  /**
   * Union type of all slashdown-specific node types
   */
  type SlashDownNode = Root | SlashDownTag

  /**
   * The complete AST type (root node)
   */
  type Ast = Root

  /**
   * Configuration for markdown parsing
   */
  interface MarkdownHandlerOptions {
    /**
     * Micromark extensions to use
     */
    extensions?: any[]
    /**
     * MDAST extensions to use
     */
    mdastExtensions?: any[]
  }

  /**
   * Renderer interface
   */
  interface Renderer {
    render(input: Ast): string;
  }
}