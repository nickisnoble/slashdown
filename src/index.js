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

// Shitty syntax highlighting
const output = lex.tokens
  .reduce( (all, one) => {
    let color = '#7FDBFF';
    switch( one.type ) {
      case "block":
        color = "#fc0";
        break;
      case "arg":
        color = "#FF851B";
        break;
      case "md":
        color = " #39CCCC";
        break;
    }

    all += `<span style="color: ${color}">${one.lexeme}</span>`

    return all + " ";
  }, ``)

let readout = document.createElement("pre");
let code = document.createElement("code");

code.insertAdjacentHTML( "beforeend", output );
readout.appendChild( code )

document.body.appendChild( readout )