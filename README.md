# SlashDown

For when MDX is too much, but Markdown is too little.

## Basic Usage

`$ npm install slashdown`

```js
import { createSlashdown } from 'slashdown';

const sd = createSlashdown();
const markup = sd`
  /header.flex.justify-between
    # Slashdown
    [Get it](#)

  /ul .grid.grid-cols-3

    /li
      ### Easy to read
      - lots of space

    /li
      ### Fast to write
      - type, type, type

    /li
      ### You already know it
      - Just markdown with extra oomph
`
```

## Alternate renderers

While the default is HTML, Slashdown also ships with a JSON renderer that simply serializes the AST.

```js
import { createSlashdown, JSONRenderer } from 'slashdown';
const sd = createSlashdown({ renderer: JSONRenderer });

sd`/h1 = Hello World`
/* Returns:
  [{
    "type": "Tag",
    "tagName": "h1",
    "children": [
      {
        "type": "Text",
        "content": "Hello World"
      }
    ]
  }]
*/
```

### Writing your own renderer

You can easily write your own renderer by implmenting the SD.Renderer type (a class that has a render method, accepting an AST and returning a string).

Note that Slashdown considers consecutive Markdown to be a single node, and leaves markdown processing entirely up to the renderer.

---

## Known issues

- Ids/class shorthand conflict with id / class attributes.
- Codefences not yet supported properly.

## Future

- Conformance to the Unist specification
- Renderers for popular component frameworks, eg Svelte