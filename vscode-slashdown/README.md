# Slashdown for Visual Studio Code

Syntax highlighting for Slashdown - "For when MDX is too much, but Markdown is too little."

## Features

This extension provides comprehensive syntax highlighting for Slashdown files, including:

- **Tag syntax**: `/tagname` with proper highlighting for HTML-like tags
- **IDs**: `#id-name` highlighting
- **Classes**: `.class-name` highlighting
- **Attributes**: Support for both `key="value"` and boolean attributes
- **Text content**: `= inline text` syntax
- **Comments**: `//` line comments
- **Code fences**: Triple backtick code blocks with language-specific syntax highlighting
- **Markdown**: Full markdown support including:
  - Headings (h1-h6)
  - Bold and italic text
  - Inline code
  - Links
  - Lists (ordered and unordered)

## Usage

Create a file with a `.sd` or `.slashdown` extension and start writing Slashdown:

```slashdown
/header .flex.justify-between
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
```

## Slashdown Syntax Overview

### Tags
Start a tag with `/` followed by the tag name:
```slashdown
/div
/header
/button
```

Use `/` alone as shorthand for `div`:
```slashdown
/ #container .wrapper
```

### IDs and Classes
Add IDs with `#` and classes with `.`:
```slashdown
/header #main-header .flex.justify-between
```

### Attributes
Add attributes on the same line or on following lines:
```slashdown
/button = Click me
  hx-post="/api/roll"
  hx-trigger="click"
  class="bg-blue-500"
  disabled
```

### Text Content
Use `=` for inline text content:
```slashdown
/h1 = Hello World
/p = This is a paragraph
```

### Markdown
Regular markdown works anywhere:
```slashdown
/article
  # Main Heading

  This is a paragraph with **bold** and *italic* text.

  - List item 1
  - List item 2
```

### Code Fences
Triple backticks work as expected:
````slashdown
/div
  Here's some code:

  ```javascript
  console.log('Hello, world!');
  ```
````

### Comments
Use `//` for line comments:
```slashdown
// This is a comment
/div
  // This is also a comment
  # Not a comment
```

## Installation

### From VSIX
1. Download the `.vsix` file from the releases
2. Open VSCode
3. Go to Extensions (Ctrl+Shift+X)
4. Click the "..." menu at the top
5. Select "Install from VSIX..."
6. Choose the downloaded `.vsix` file

### From Source
1. Clone this repository
2. Run `npm install -g @vscode/vsce` if you don't have it
3. Run `vsce package` in the extension directory
4. Install the generated `.vsix` file as described above

## Requirements

- Visual Studio Code 1.75.0 or higher

## Known Issues

None at this time. Please report issues on the [GitHub repository](https://github.com/nickisnoble/slashdown).

## Release Notes

### 0.1.0

Initial release of Slashdown syntax highlighting:
- Tag syntax highlighting
- ID and class highlighting
- Attribute highlighting
- Inline text content
- Markdown support
- Code fence support with language-specific highlighting
- Comment support

## About Slashdown

Slashdown is a markup language that combines the simplicity of Markdown with HTML-like tag syntax. Learn more at [github.com/nickisnoble/slashdown](https://github.com/nickisnoble/slashdown).

## License

MIT
