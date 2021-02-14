import Lexer from './classes/Lexer'


// DEBUG
const source = `
  /hero is-sticky
    
    # This is proseCMS
    It's a dead simple content management system / markdown flavor.

  // This is a comment
  /columns 3 equal

    /column A

      ### Dead simple
      - Portable Markdown + layout
      - Realtime preview
      - drop in, batteries not needed


    /column B

      ### Works how you want
      - As a headless CMS
      - With a database


    /column C

      ### Hackable AF
      - Add your own functions
      - Style the editor

  /footer
`

const lex = new Lexer( source );
lex.startTokenization();

const output = lex.tokens
  .filter( t => t.type != "newline")
  .map( t => (`\n[${t.type}]\n${t.lexeme}\n`))

let readout = document.createElement("pre");
let code = document.createElement("code");
let content = document.createTextNode( output.join(' ') )

code.appendChild( content )
readout.appendChild( code )

document.body.appendChild( readout )