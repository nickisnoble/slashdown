import type { SD } from "./types";
import JSONRenderer from "./renderers/json"; // TODO: Switch default to HTML
import { Lexer } from "./lexer";
import { Parser } from "./parser";

class Slashdown {
  src: string;
  render: SD.Renderer;

  constructor( src = "", renderer = JSONRenderer ) {
    this.src = src;
    this.render = renderer;
  }

  process( src = this.src ) {
    this.src = src;

    const tokens = new Lexer( src ).tokens();
    const ast = new Parser( tokens ).ast();
    return this.render( ast );
  }
}


function sd(strings: TemplateStringsArray, ...values: any[]) {
  const fullString = strings.reduce((result, string, i) => (
    result + string + (values[i] || '')
  ), '').replace(/^\n+|\n+$/g, ''); // remove leading or trailing newlines

  return new Slashdown(fullString).process();
}


export {
  Slashdown,
  sd
}