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

  // Slashdown-specific nodes

  /**
   * Element node representing an HTML element
   * Can contain both element nodes and mdast content as children
   */
  interface Element extends UnistNode {
    type: 'element'
    tagName: string
    attributes?: { [key: string]: string | boolean }
    classes?: string[]
    ids?: string[]
    children: (Element | MdastContent)[]
    position?: Position
    data?: any
  }

  /**
   * Root node containing the entire document
   */
  interface Root extends UnistNode {
    type: 'root'
    children: (Element | MdastContent)[]
    position?: Position
    data?: any
  }

  /**
   * Union type of all Slashdown-specific node types
   */
  type SlashdownNode = Root | Element

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