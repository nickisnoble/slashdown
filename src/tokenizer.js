import dedent from 'dedent';

function classify( line ) {
  // get number of leading spaces
  const depth = line.match(/^[^\S\r\n]*/)[0].length;

  // discern type
  const type = line.match(/^[ ]*\//) ? 
                // ...then check if it starts with //
                line.match(/^[ ]*\/\//) ?
                  // ...in which case:
                  "comment" : "block" 
                // else, no / ...
                : "content";

  return {
    depth,
    type
  }
}

function tokenize( source ) { 
  let tokens = [];
  const previous = () => tokens[ tokens.length - 1 ];
  const lines = source.split("\n");
  
  for( let line of lines ) {
    const lastToken = previous();

    // Find out what kind and how deep
    const { depth, type } = classify( line );
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
      // Take the line, filtering out empties
      const words = line.split(' ').filter( c => c );
      
      // Push the block itself
      tokens.push({
        type: "block",
        value: words.shift().replace("/", ""), // removes first item
        depth
      });

      // push each subsequent item as args
      words.forEach( arg => tokens.push({
        type: "argument",
        value: arg,
        depth
      }));

      continue;
    }

    // If we've got this far,
    // push whatever we've got to the list
    tokens.push( token );
  }

  // Clean and return tokens
  return tokens.filter( t => t.value )

    // ...also dedent contents so markdown can render properly
    .map( t => {
      if( t.type == "content" ) {
        t.value = dedent( t.value );
      }

      return t;
    });
}


export default tokenize;