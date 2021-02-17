import Token from './Token'

class Lexer {
  tokens = [];

  _line = 0;
  _column = 0;
  _indent = 0;
  _next = 0;
  _start = 0;

  // Testers
  _is = {
    alpha: c => !!c.match(/[A-Za-z_\-]/),
    digit: c => !!c.match(/[0-9]/),
    alphaNumeric: c => !!c.match(/[0-9A-Za-z_\-]/),
    comment: c => {
      const s = c + this.lookahead(1);
      return !!s.match(/\/\//);
    }
  }

  // Main bits
  
  constructor( source ) {
    this.source = source;
    this._eof   = source.length;

    this.tokenize()
  }

  tokenize() {
    while( !this.isCompleted() ) {
      this._start = this._next; // we're about to advance
      this._indent = this._column;

      // Cursors
      const character = this.advance();
      const previous = this.tokens[this.tokens.length - 1];

      // Empty token
      let token;

      // Skip through whitespace
      if( character == " " ) continue;

      // Skip through comments
      if( this._is.comment( character ) ) {
        this.comment();
        continue;
      }

      // Newlines
      if( character == "\n" ) {
        token = this.newline();
        this._line++;
        this._column = 0;
      } 

      // Commands
      else if ( character == "/" ) {
        token = this.command();
      } 

      // Newline would have been picked up already
      else if ( ["command", "arg"].includes( previous?.type ) ) {
        token = this.arg();
      } 

      else {
        token = this.content();
      }

      if( token ) {
        this.tokens.push( token )  
      } else {
        console.error(`"${character}" not recognized`)
      }
      
    }
  }

  // Consumers

  newline() {
    return new Token('newline', "\n", this.getLocation())
  }

  command() {
    let text = this.source[ this._start ];

    while( this.lookahead() != "\n" && !this.isCompleted() ) {
      const c = this.advance();
      if(!this._is.alphaNumeric(c)) break;
      text += c;
    }

    return new Token('command', text, this.getLocation())
  }

  arg() {
    let text = this.source[ this._start ];

    while( this.lookahead() != "\n" && !this.isCompleted() ) {
      const c = this.advance();
      if(!this._is.alphaNumeric(c)) break;
      text += c;
    }

    return new Token('arg', text, this.getLocation())
  }

  content() {
    let buffer = "";
    const encounter = () => {
      buffer += this.lookahead();
      return !!buffer.match(/^[ |\t]*\//)
    }
    
    let text = this.source[ this._start ];

    while( !this.isCompleted() && !encounter() ) {
      const c = this.advance();

      // Reset buffer on newline
      if( c == "\n" ) {
        buffer = "";
      }

      text += c;
    }

    return new Token('content', text, this.getLocation())
  }

  comment() {
    while( this.lookahead() != "\n" && !this.isCompleted() ) {
      this.advance();
    }
  }


  // Traversal

  lookahead( amount = 1 ) {
    const look = (this._next - 1) + amount;
    return this.source[look] ?? "\0"
  }

  advance() {
    const cursor = this.lookahead(1);
    this._next++;
    this._column++;
    return cursor;
  }

  isCompleted() {
    return this._next >= this._eof;
  }

  // Util

  getLocation() {
    return {
      indent: this._indent,
      start: this._start,
      end: this._next - 1,
      line: this._line,
      column: this._column,
    }
  }
 
}

export default Lexer;