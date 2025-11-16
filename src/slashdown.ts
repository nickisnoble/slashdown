import type { SD } from "./types";
import { Lexer } from "./lexer";
import { Parser, ParserOptions } from "./parser";
import HTMLRenderer from "./renderers/html";
import JSONRenderer from "./renderers/json";

/**
 * Configuration options for Slashdown
 */
export interface SlashdownOptions {
  /** Initial source content to process */
  src?: string;
  /** Custom renderer class (defaults to HTMLRenderer) */
  renderer?: new() => SD.Renderer;
  /** Default tag for `/` shorthand (defaults to 'div') */
  defaultTag?: string;
  /** Maximum nesting depth to prevent stack overflow (defaults to 100) */
  maxDepth?: number;
}

/**
 * Main Slashdown processor class
 *
 * Converts SlashDown markup to HTML (or other formats via custom renderers)
 * through a three-stage pipeline: Lexer → Parser → Renderer
 *
 * @example
 * ```typescript
 * const sd = new Slashdown();
 * const html = sd.process('/div .container = Hello World');
 * ```
 */
class Slashdown {
  src: string;
  lexer: Lexer;
  parser: Parser;
  renderer: SD.Renderer;
  tokens: SD.Token[];
  ast: SD.Ast;
  private options: SlashdownOptions;

  constructor({ src = "", renderer = HTMLRenderer, defaultTag = "div", maxDepth = 100 }: SlashdownOptions = {}) {
    this.src = src;
    this.options = { src, renderer, defaultTag, maxDepth };
    this.renderer = new renderer();

    this.lexer = new Lexer();
    this.parser = new Parser([], { defaultTag, maxDepth });

    this.tokens = [];
    this.ast = [];
  }

  /**
   * Process SlashDown source through the full pipeline
   * @param src - SlashDown source code
   * @returns Rendered output (typically HTML string)
   */
  process( src = this.src ): string {
    this.src = src;
    return this.tokenize().parse().render();
  }

  /**
   * Tokenize source into lexical tokens
   * @returns This instance for chaining
   */
  tokenize(): this {
    if( !this.src.length ) {
      this.tokens = [];
      return this;
    }
    this.tokens = this.lexer.tokens(this.src);
    return this;
  }

  /**
   * Parse tokens into an Abstract Syntax Tree
   * @returns This instance for chaining
   */
  parse(): this {
    if( !this.tokens.length ) {
      this.ast = [];
      return this;
    }
    this.ast = this.parser.parse(this.tokens);
    return this;
  }

  /**
   * Render the AST to output format
   * @returns Rendered output string
   */
  render(): string {
    if( !this.ast.length ) {
      return '';
    }
    return this.renderer.render( this.ast );
  }
}

/**
 * Create a SlashDown processor with tagged template literal support
 *
 * @param options - Configuration options
 * @returns Tagged template function
 *
 * @example
 * ```typescript
 * const sd = createSlashdown();
 * const html = sd`
 *   /header.flex
 *     # Welcome
 * `;
 * ```
 */
function createSlashdown(options: SlashdownOptions = {}): (strings: TemplateStringsArray, ...values: any[]) => string {
  const instance = new Slashdown(options);

  return (strings: TemplateStringsArray, ...values: any[]): string => {
    const src = strings.reduce((result, string, i) => (
      result + string + (values[i] || '')
    ), '').replace(/^\n+|\n+$/g, '');

    instance.src = src;
    return instance.process();
  };
}

export {
  createSlashdown,
  Slashdown,
  HTMLRenderer,
  JSONRenderer
}