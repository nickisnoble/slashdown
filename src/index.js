import Lexer from './classes/Lexer'
import Parser from './classes/Parser'

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
const parser = new Parser( lex.tokens );
const pretty = JSON.stringify( parser.ast, null, 2 )
// const types = tokens
  // .map( t => `[${t.type}] ${t.text == "\n" ? "\\n" : t.text }` )

document.body.innerHTML = `
  <pre>
    <code>
${pretty}
    </code>
  </pre>
`