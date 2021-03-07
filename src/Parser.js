class Parser {
  ast = []
  _next = 0;

  constructor( tokens ) {
    this.tokens = tokens;
    this.parse();
  }

  parse() {
    while(this.hasRemainingTokens()) {
      const node = this.parseRecursively();

      if( node ) {
        this.ast.push(node)
      }
    }
  }

  parseRecursively( depth = 0 ){
    if( !this.hasRemainingTokens() ) return;

    const cursor = this.advance(),
          next = this.lookahead();

    let indent = depth || cursor.location.indent;
    const node = cursor.type == "newline" ? null : this[cursor.type]();

    if( !node ) return;

    if( node?.type == "command" ) {
      indent = node.location.indent
      let children = []

      while( this.lookahead()?.location.indent > indent || this.lookahead()?.type == "newline" ) {
        const child = this.parseRecursively( indent );
        if( child ) {
          children.push( child )
        }
      }

      node.children = children;
    }

    delete node.location;
    return node;
  }

  // Parsers

  command() {
    const node = this.current();

    // Handle args
    let args = []
    while( this.lookahead().type == "arg" ) {
      const arg = this.advance();
      args.push( arg.value )
    }
    if( args.length ) node.args = args;

    return node;
  }

  content() {
    const node = this.current();
    delete node.location;
    return node;
  }

  // Traversal

  lookahead( amount = 1 ) {
    const look = (this._next - 1) + amount;
    return this.tokens[look];
  }

  lookbehind() {
    return this.lookahead(-1);
  }

  current() {
    return this.lookahead(0);
  }

  advance() {
    const cursor = this.lookahead(1);
    this._next++;
    return cursor;
  }

  hasRemainingTokens() {
    return this._next < this.tokens.length;
  }
}

export default Parser