import Token from './Token'

const isAlpha = c => c.match(/[A-Za-z_-]/g);
const isDigit = c => c.match(/[0-9]/g);
const isAlphaNumeric = c => isAlpha(c) || isDigit(c);

class Lexer {
  tokens = [];
  line = 0;
  column = 0;
  next_p = 0;
  lexemeStart_p = 0;
  
  sourceCompleted = () => this.next_p >= this.source.length;
  
  constructor( source ) {
    this.source = source;
  }
  
  lookahead(offset = 1) {
    const lookahead_p = (this.next_p - 1) + offset;
    
    // Guard against looking past file end
    if (lookahead_p >= this.source.length) return "\0";
    return this.source[lookahead_p]
  }
  
  consume() {
    const c = this.lookahead();
    this.next_p += 1;
    
    return c;
  }
  
  startTokenization() {
    while( !this.sourceCompleted() ) {
      this.tokenize()
    }
  }
  
  tokenize() {
    this.lexemeStart_p = this.next_p;
    this.column += 1;
    
    const previous_t = this.tokens[ this.tokens.length - 1 ]
    let token = null;
    let c = this.consume();
    
    // Skip whitespace
    if ( [' ', "\t"].includes(c) ) {
      return; 
    }
    
    // If it's the end of a line
    if (c == "\n") {
      this.tokens.push( new Token('newline', "\n", null, this.currentLocation()))
      
      this.line += 1;
      this.column = 0; // reset column
      return; 
    }
    
    // If the current is /, and the next is /
    // aka //
    // it's a comment and we should ignore it
    if ( c == "/" && c == this.lookahead()) {
      this.ignoreComment();
      return;
    }
    
    // If it's / immediately followed by a letter,
    // it's a block
    if ( c == "/" && isAlpha( this.lookahead() ) ) {
      token = this.isBlock();
    } 
    
    // if the previous type is a block or an arg, and there hasn't been a newline, 
    // it's likely another arg
    else if ( ['block', 'arg'].includes(previous_t?.type) ) {
      token = this.isArg();
    }
    
    // Otherwise we assume markdown
    else if ( (!previous_t || previous_t.type == 'newline' ) ) {
      token = this.isMarkdownLine();
    }
   
    if( token ) {
      this.tokens.push( token )
    } else {
      console.error(`Unrecognized character: ${c}, at ${
        this.source.substring(this.lexemeStart_p, this.next_p + 10)
      }`)
    }
  }
  
  // Types
  isBlock() {
    while( isAlphaNumeric( this.lookahead() ) ) {
      this.consume()
    }
    
    const block = this.source.substring(this.lexemeStart_p, this.next_p);
    const type = 'block';
    
    return new Token(type, block, null, this.currentLocation() )
  }
  
  isArg() {
    while( isAlphaNumeric( this.lookahead() ) ) {
      this.consume()
    }
    
    const lexeme = this.source.substring(this.lexemeStart_p, this.next_p);
    const type = 'arg';
    
    return new Token(type, lexeme, null, this.currentLocation() )
  }
  
  isMarkdownLine(){
    let blockBuffer = "";
    const blockEncountered = () => blockBuffer.match(/^[ |\t]+\//g)

    while( !this.sourceCompleted() ) {
      blockBuffer += this.lookahead();

      if( blockEncountered() ) break;

      // Count lines in Markdown too
      if ( this.lookahead() == "\n" ) {
        this.line += 1;
        this.column = 0; // reset column
        blockBuffer = "" // reset buffer
      }
      
      this.consume(); 
    }
    
    // Capture raw
    const literal = this.source.substring(this.lexemeStart_p, this.next_p);
    
    // Trim leading whitespace
    const lexeme = literal //.replace(/^[\S\t]+/gm, "")
    const type = 'md';
    
    return new Token(type, lexeme, literal, this.currentLocation() )
  }
  
  ignoreComment(){
    while( this.lookahead() != "\n" && !this.sourceCompleted() ) {
      this.consume()     
    }
  }
  
  // Utility
  
  currentLocation() {
    return {
      line: this.line,
      column: this.column,
      length: this.next_p - this.lexemeStart_p
    }
  }
}

export default Lexer;