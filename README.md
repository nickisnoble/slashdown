# SlashDown

SlashDown is aimed to be similar to markdown, but allowing one to represent hierarchy easily.

## Target

SlashDown isn't anywhere near ready, but the initial target is as follows:

### Input
```
/hero marketing
    
  # This is an example
  SlashDown uses markup to create structure.

// This is a comment
/columns 3 equal

  /column A

    ### Dead simple
    - Portable Markdown + layout
    - Realtime preview
    - Drop in, batteries not needed


  /column B

    ### Works how you want
    - As a headless CMS
    - With a database


  /column C

    ### Hackable AF
    - Add your own functions
    - Style the editor
```

### Output
```html
<!-- By default, args just become classes -->
<div class="hero marketing">
  <h1>This is an example</h1>
  <p>LayoutDown uses markup to create layout.</p>
</div>

<!-- When a matching function is supplied, args can be handled arbitrarily -->
<div class="columns grid" data-columns="3">
  <div class="column column-A">
    <h3>Dead simple</h3>
    <ul>
      <li>Portable Markdown + layout</li>
      <li>Realtime preview</li>
      <li>Drop in, batteries not needed</li>
    </ul>
  </div>
  <div class="column column-B">
    <h3>Works how you want</h3>
    <ul>
      <li>As a headless CMS</li>
      <li>With a database</li>
    </ul>
  </div>
  <div class="column column-C">
    <h3>Hackable AF</h3>
    <ul>
      <li>Add your own functions</li>
      <li>Style the editor</li>
    </ul>
  </div>
</div>
```
