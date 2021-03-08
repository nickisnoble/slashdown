import Lexer from './Lexer'
import Parser from './Parser'
import Renderer from './Renderer'

const source = `  
# This is slashdown
For when MDX is too much, but Markdown is too little.

// This is a comment
/columns three equal

  /column A

    ### Dead simple
    - type a slash / get a div
    - drop in, batteries not really needed

  /column B

    ### Works how you want
    - Portable
    - Framework agnostic

  /column C

    ### Hackable AF
    - Parse content however you wany
    - Add your own block rendering functions

/footer

  © 2021 Miniware;

  test.
`

const lexed = new Lexer( source );
const parsed = "not yet" // new Parser( lexed.tokens );
const rendered = "not yet" // new Renderer( parsed.ast );

const app = document.getElementById('app');

app.innerHTML = `
  <pre class="lexed">
    <code>
${lexed.tokens.map( t => `[${t.type}]`).join("\n")}
    </code>
  </pre>
  <pre class="parsed">
    <code>
${
      // JSON.stringify(parsed.ast, null, 2)
      lexed.tokens.map( t => `${
        JSON.stringify(t, null, 2)
      }`).join("\n")
}
    </code>
  </pre>
  <div class="preview">
${rendered.markup}
  </div>
`