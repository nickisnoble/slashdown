# SlashDown

For when MDX is too much, but Markdown is too little.

## Basic Usage

`$ npm install slashdown`

```js
import slashdown from 'slashdown';

const markup = slashdown(content)
```

**Note:** Slashdown doesn't do any sanitization!

### Input
```
# This is slashdown
For when MDX is too much, but Markdown is too little.

// This is a comment
/columns three equal

  /column A
    ### Dead simple
    - type a slash, get a div
    - drop in, "batteries included"

  /column B
    ### Works how you want
    - Portable, like markdown
    - Framework agnostic

  /column C
    ### Hackable AF
    - Parse content however you wany
    - Add your own block rendering functions

/footer
  © 2021 Miniware;
```

### Output
```html
<h1 id="this-is-slashdown">This is slashdown</h1>
<p>For when MDX is too much, but Markdown is too little.</p>

<div class="columns three equal">
  
  <div class="column A">
    <h3 id="dead-simple">Dead simple</h3>
    <ul>
      <li>type a slash, get a div</li>
      <li>drop in, batteries not really needed</li>
    </ul>
  </div>

  <div class="column B">
    <h3 id="works-how-you-want">Works how you want</h3>
    <ul>
      <li>Portable</li>
      <li>Framework agnostic</li>
    </ul>
  </div>

  <div class="column C">
    <h3 id="hackable-af">Hackable AF</h3>
    <ul>
      <li>Parse content however you wany</li>
      <li>Add your own block rendering functions</li>
    </ul>
  </div>

</div>

<div class="footer">
  <p>© 2021 Miniware;</p>
</div>
```