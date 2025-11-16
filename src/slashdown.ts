import type { SD } from "./types";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import HTMLRenderer from "./renderers/html";
import JSONRenderer from "./renderers/json";

/**
 * Configuration options for Slashdown
 */
interface SlashdownOptions {
  /** Source string to parse */
  src?: string;
  /** Renderer class to use for output (default: HTMLRenderer) */
  renderer?: new() => SD.Renderer;
  /** Markdown handler configuration */
  markdownOptions?: SD.MarkdownHandlerOptions;
}

/**
 * Main Slashdown processor
 * Converts Slashdown syntax to HTML or other formats
 */
class Slashdown {
  src: string;
  lexer: Lexer;
  parser: Parser;
  renderer: SD.Renderer;
  tokens: SD.Token[];
  ast: SD.Ast;
  markdownOptions?: SD.MarkdownHandlerOptions;

  constructor({ src = "", renderer = HTMLRenderer, markdownOptions }: SlashdownOptions = {}) {
    this.src = src;
    this.renderer = new renderer;
    this.markdownOptions = markdownOptions;

    this.lexer = new Lexer();
    this.parser = new Parser([], markdownOptions);

    this.tokens = [];
    this.ast = { type: 'root', children: [] };
  }

  /**
   * Process source string through tokenize -> parse -> render pipeline
   * @param src - Source string to process (defaults to this.src)
   * @returns Rendered output string
   */
  process( src = this.src ) {
    this.src = src;
    return this.tokenize().parse().render();
  }

  /**
   * Tokenize source string into tokens
   * @returns this for chaining
   */
  tokenize() {
    if( !this.src.length ) throw new Error("Slashdown source is empty");
    this.lexer = new Lexer(this.src);
    this.tokens = this.lexer.tokens();

    return this;
  }

  /**
   * Parse tokens into AST
   * @returns this for chaining
   */
  parse() {
    if( !this.tokens.length ) throw new Error("No tokens to parse");
    this.parser = new Parser(this.tokens, this.markdownOptions);
    this.ast = this.parser.ast();

    return this;
  }

  /**
   * Render AST to output string
   * @returns Rendered output
   */
  render() {
    if( !this.ast.children.length ) throw new Error("No AST to render");
    return this.renderer.render( this.ast );
  }
}

/**
 * Create a template literal tag function for Slashdown
 * @param options - Slashdown configuration options
 * @returns Template tag function
 * @example
 * ```ts
 * const sd = createSlashdown();
 * const html = sd`/ .container = Hello World!`;
 * ```
 */
function createSlashdown(options: SlashdownOptions = {}): (strings: TemplateStringsArray, ...values: any[]) => any {
  const instance = new Slashdown(options);

  return (strings: TemplateStringsArray, ...values: any[]) => {
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

// Export types for users
export type { SD } from "./types"
export { Lexer } from "./lexer"
export { Parser } from "./parser"
export { MarkdownHandler } from "./markdown-handler"