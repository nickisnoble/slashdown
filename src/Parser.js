export default function toSyntaxTree( tokens ) {
  let ast = [],
      next = 0;


  while( hasRemainingTokens() ) {
    const node = traverse();

    if( node ) {
      ast.push(node)
    }
  }

  return ast;


  function traverse( scope = 0 ) {
    if( !hasRemainingTokens() ) return;

    const { type, depth } = advance(),
          next = lookahead();

    let indent = scope || depth;
    const node = parse( type );

    if( !node ) return;

    if( node.type == "block" ) {
      indent = node.depth;
      let children = [];

      while( lookahead()?.depth > indent ) {
        const child = traverse( indent );
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

  function parse(type) {
    const node = current();

    switch( type ) {
      case "block":
        // Handle args
        let args = []
        while( lookahead().type == "argument" ) {
          const arg = advance();
          args.push( arg.value )
        }
        if( args.length ) node.arguments = args;

        return node;
        break;

      // Includes "content"
      default:
        return node;
    }
  }

  // Traversal

  function lookahead( amount = 1 ) {
    const look = (next - 1) + amount;
    return tokens[look];
  }

  function current() {
    return lookahead(0);
  }

  function advance() {
    const cursor = lookahead(1);
    next++;
    return cursor;
  }

  function hasRemainingTokens() {
    return next < tokens.length;
  }
}