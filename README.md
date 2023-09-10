# SlashDown

For when MDX is too much, but Markdown is too little.

## Basic Usage

`$ npm install slashdown`

```js
import slashdown from 'slashdown';

const sd = new Slashdown()
const markup = sd(content)
```

## Known issues

- Ids/class shorthand conflict with id / class attributes.
- Codefences not yet supported