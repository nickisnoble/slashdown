import dedent from 'dedent'

class Lexer {
  tokens = [];
  
  constructor( source ) {
    this.lines = source.split("\n");
    this.tokenize()
  }

  tokenize() {
    // Read
    for( let line of this.lines ) {
      const lastToken = this.previous()

      // Find out what kind and how deep
      const { depth, type } = this.classify( line );
      if( type == "comment" ) continue;

      const token = {
        type,
        depth,
        value: line
      }

      // Concatenate consecutive content lines
      if ( 
          token.type == "content"
          && lastToken?.type == "content" 
          && token.depth >= lastToken.depth
        ) {

        // Join by newline
        lastToken.value += "\n" + line;

        // Next loop;
        continue;
      }

      if (token.type == "block") {
        // Take the line
        const signature = line.split(' ')
                              .filter( c => c );
        
        // Push the block itself
        this.tokens.push({
          type: "block",
          value: signature.shift().replace("/", ""), // takes first item
          depth
        });

        signature.forEach( arg => this.tokens.push({
          type: "argument",
          value: arg, // takes first item
          depth
        }));

        continue;
      }

      // If we've got this far,
      // push whatever we've got to the list
      this.tokens.push( token );
    }

    // Clean
    this.tokens = this.tokens
      .filter( t => t.value )
      .map( t => {
        if( t.type == "content" ) {
          t.value = dedent( t.value );
        }

        return t;
      })
  }

  classify( line ) {
        // get number of leading spaces
    let depth = line.match(/^[ ]*/)[0].length,

        // check if *all* spaces
        empty = line.match(/^[ ]*$/),

        // if it starts with /
        type  = line.match(/^[ ]*\//) ? 
          // ...then check if it starts with //
          line.match(/^[ ]*\/\//) ?
            // ...in which case:
            "comment"
            // otherwise...
            : "block" 
          // else...
          : "content";

    return {
      depth: empty ? 0 : depth,
      type
    }
  }

  previous() {
    return this.tokens[ this.tokens.length - 1 ]
  }
}

export default Lexer;