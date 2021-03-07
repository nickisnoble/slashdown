import Lexer from './src/Lexer'
import Parser from './src/Parser'
import Renderer from './src/Renderer'

export default function slashdown( raw ) {
  const lexed = new Lexer( raw );
  const parsed = new Parser( lexed.tokens );
  const rendered = new Renderer( parsed.ast );

  return rendered.markup;
}