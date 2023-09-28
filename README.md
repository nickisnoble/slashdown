# SlashDown

For when MDX is too much, but Markdown is too little.

## Basic Usage

`$ npm install slashdown`

```js
import { sd } from 'slashdown';

const markup = sd`
  /header
    # Slashdown

  /ul .grid.grid-cols-3

    /li
      ### Easy to read

    /li
      ### Fast to write

    /li
      ### You already know it
`
```

## Known issues

- Ids/class shorthand conflict with id / class attributes.
- Codefences not yet supported