import lex  from './src/lexer'
import parse from './src/parser'
import render from './src/renderer'

export default function slashdown( src ) {
  const tokens = lex( src );
  const tree   = parse( tokens );
  const html   = render( tree );

  return html;
}