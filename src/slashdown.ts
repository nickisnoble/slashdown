import type { SD } from "./types";
import JSONRenderer from "./renderers/json"; // TODO: Switch default to HTML
import { Lexer } from "./lexer";
import { Parser } from "./parser";

class Slashdown {
  src: string;
  lexer: Lexer;
  parser: Parser;
  renderer: SD.Renderer;
  tokens: SD.Token[];
  ast: SD.Ast;

  constructor( src = "", renderer = JSONRenderer ) {
    this.src = src;
    this.renderer = new renderer;

    this.lexer = new Lexer();
    this.parser = new Parser();

    this.tokens = [];
    this.ast = [];
  }

  process( src = this.src ) {
    this.src = src;
    return this.tokenize().parse().render();
  }

  tokenize() {
    if( !this.src.length ) console.warn("Slashdown source is empty!");
    this.tokens = new Lexer( this.src ).tokens();

    return this;
  }

  parse() {
    if( !this.tokens.length ) console.warn("No tokens to parse. Please ensure the slashdown source is tokenized before parsing.");
    this.ast = new Parser( this.tokens ).ast()

    return this;
  }

  render() {
    if( !this.ast.length ) console.warn("No AST to render. Please ensure the slashdown source is tokenized and parsed before rendering.");
    return this.renderer.render( this.ast );
  }
}


function sd(strings: TemplateStringsArray, ...values: any[]) {
  const src = strings.reduce((result, string, i) => (
    result + string + (values[i] || '')
  ), '').replace(/^\n+|\n+$/g, ''); // remove leading or trailing newlines

  return new Slashdown(src).process();
}


export {
  Slashdown,
  sd
}