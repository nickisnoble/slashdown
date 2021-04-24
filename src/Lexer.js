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
       console.log(`${depth} \n\n`)

      if( type == "comment" ) continue;

      const token = {
        type,
        depth,
        value: line
      }

      // Concatenate consecutive content lines
      if ( token.type == "content" && lastToken?.type == "content" ) {

        // Join by newline
        lastToken.value += "\n" + line;

        // Next loop;
        continue;
      }

      // Skip blank lines that are not inside content
      if ( !!line.match(/^[ ]*$/) ) {
        continue;
      }

      if (token.type == "block") {
        // Take the line
        const words = line.split(' ')
                              .filter( c => c );
        
        // Push the block itself
        this.tokens.push({
          type: "block",
          value: words.shift().replace("/", ""), // removes first item
          depth
        });

        words.forEach( arg => this.tokens.push({
          type: "argument",
          value: arg,
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
    let depth = line.match(/^[^\S\r\n]*/)[0].length,

        // if it starts with /
        type = line.match(/^[ ]*\//) ? 
          // ...then check if it starts with //
          line.match(/^[ ]*\/\//) ?
            // ...in which case:
            "comment"
            // otherwise...
            : "block" 
          // else...
          : "content";
    console.log(depth)
    return {
      depth,
      type
    }
  }

  previous() {
    return this.tokens[ this.tokens.length - 1 ]
  }
}

export default Lexer;