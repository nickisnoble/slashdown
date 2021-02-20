import Lexer from './src/Lexer'
import Parser from './src/Parser'

export function process( source ) {
  const lex = new Lexer( source );
  const parser = new Parser( lex.tokens );
    
  return parser.ast;
}

export default {
  Lexer,
  Parser
}
