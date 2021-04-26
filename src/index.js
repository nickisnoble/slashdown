import tokenize from './tokenizer'
import parse from './parser'
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
      - Just copy / paste
    - Other thing

  /column C

    ### Hackable AF
    - Parse content however you wany
    - Add your own block rendering functions

/footer

  © 2021 Miniware;
`

const tokens = tokenize( source );
const parsed = parse( tokens );
const rendered = new Renderer( parsed );

const app = document.getElementById('app');

app.innerHTML = `
  <pre class="lexed">
    <code>
${tokens
    .filter( t => t.type == "content" )
    .map( t => `${t.depth}[${t.type}]`).join("\n")
}
${tokens.length}
    </code>
  </pre>
  <pre class="parsed">
    <code>
${
      JSON.stringify(parsed, null, 2)
}
    </code>
  </pre>
  <div class="preview">
${
  rendered.markup
}

  </div>
`