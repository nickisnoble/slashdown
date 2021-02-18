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
      this.ast.push(node)
    }
  }

  parseRecursively( depth = 0 ){
    if( !this.hasRemainingTokens() ) return;

    const cursor = this.advance(),
          next = this.lookahead();

          console.log(depth, cursor.type)

    if( !next ) return;

    let indent = depth || cursor.location.indent;
    const node = cursor.type == "newline" ? cursor : this[cursor.type]();

    if( node.type == "command" && next.location.indent > indent) {
      indent = node.location.indent
      let children = []

      while( this.lookahead()?.location.indent > indent || this.lookahead()?.type == "newline" ) {
        children.push( this.parseRecursively( indent ) )
      }

      node.children = children;
    }

    return node;
  }

  // Parsers

  command() {
    const node = this.current();

    // Handle args
    if( this.lookahead().type == "arg" ){
      node.args = []
    }

    while( this.lookahead().type == "arg" ) {
      const arg = this.advance();

      node.args.push( arg );
    }

    return node;
  }

  content() {
    return this.current();
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