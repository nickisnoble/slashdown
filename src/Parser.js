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

    let indent = depth || cursor.depth;
    const node = this[cursor.type]();

    if( !node ) return;

    if( node.type == "block" ) {
      indent = node.depth;
      let children = [];

      while( this.lookahead()?.depth > indent ) {
        const child = this.parseRecursively( indent );
        if( child ) {
          children.push( child );
        }
      }

      node.children = children;
    }

    // delete node.depth;
    return node;
  }

  // Parsers

  block() {
    const node = this.current();

    // Handle args
    let args = []
    while( this.lookahead().type == "argument" ) {
      const arg = this.advance();
      args.push( arg.value )
    }
    if( args.length ) node.arguments = args;

    return node;
  }

  content() {
    const node = this.current();
    // delete node.depth;
    return node;
  }

  // Traversal

  lookahead( amount = 1 ) {
    const look = (this._next - 1) + amount;
    return this.tokens[look];
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