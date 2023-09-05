import type { Slashdown } from "./types"

const patterns = {
  "Tag":       /^\/([\w-]*)/,
  "Id":        /^#([\w-]+)/,
  "Class":     /^\.([\w-]+)/,
  "Attribute": /^([\w-]+="[^"]*")|^([\w-]+)/,
  "Text":      /^=\s+(.+)$/
};

const isComment = (line: string): boolean => !!line.match(/^\s*\/\//);
const isBlank = (line: string): boolean => line.trim() === "";

const spacesPreceding = ( line: string ): number => {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

export class Lexer {
  src: string;

  constructor(src: string = "") {
    this.src = src;
  }

  tokens(src: string = this.src): Slashdown.Token[] {
    this.src = src; // update src in case of new input
    const tokenList: Slashdown.Token[] = []; // reset

    let i = 0;
    const lines: string[] = src.split("\n");

    const lookahead = (n: number = 1): string => lines[i + n];
    const isTagStart = (l: string): boolean => l.trim().startsWith('/');

    function lexTagLines( startingLine: string, tagIndentLevel: number ): void {
      let remainingText = startingLine.trim();

      // Lex first line
      let matchFound = true; // we have a valid tag, to start
      do {
        matchFound = false;

        for (const type of ["Tag", "Class", "Id", "Attribute", "Text"] as const) {
          const match = remainingText.match(patterns[type]);

          if (match) {
            tokenList.push({
              type,
              content: match[1] ?? match[2], // Grab the capture group content. Some have multiple possibilities!
              indent: tagIndentLevel
            });

            remainingText = remainingText.slice(match[0].length).trim();
            matchFound = true;
            break; // break the for loop and start over because we found a match
          }
        }
      } while (matchFound);

      // Lex subsequent lines (if any)
      const moreTagDetailsMayExist = () => {
        const nextLine = lookahead(1)
        return !!nextLine && !isBlank( nextLine ) && !isTagStart( nextLine )
      }
      while ( moreTagDetailsMayExist() ) {
        // Check if the whole line matches something valid
        const nextLine = lookahead(1).trim()

        for (const type of ["Class", "Id", "Attribute", "Text"] as const) {
          const match = nextLine.match(patterns[type]);

          if (match) {
            tokenList.push({
              type,
              content: match[1] ?? match[2], // Use match[1] to exclude the prefix (/, ., #, =)
              indent: tagIndentLevel
            });

            i++; // count the line since it was valid
          }
        }

        break; // Break out if there's no match, passing any remaining content back to the main loop.
      }
    }

    function lexMarkdownLines( startingLine: string, startingIndentLevel: number ): void {
      const markdownToken: { type: "Markdown" } & Slashdown.Token = {
        type: "Markdown",
        content: startingLine.trim(),
        indent: startingIndentLevel
      };

      const markdownRemains = () => {
        const nextLine = lookahead(1)
        if (nextLine === undefined) return false;

        const notATag = !isTagStart( nextLine );
        const sameBlock = spacesPreceding(nextLine) >= startingIndentLevel;

        // If the next line:
        // - is not a tag start (/)
        // - has the same or greater indent
        // - or is blank
        // ...consider it a continuation of this markdown.
        return sameBlock && notATag || isBlank(nextLine);
      }

      while( markdownRemains() ) {
        i++; // count the line
        const line = lines[i];

        if( isBlank( line ) ) {
          markdownToken.content += "\n";
          continue;
        }

         const dedentedLine = line.slice(spacesPreceding(line));
         markdownToken.content += "\n" + dedentedLine;
      }


      // Remove any trailing newline.
      markdownToken.content = markdownToken.content.trim()

      tokenList.push( markdownToken )
    }

    while (i < lines.length) {
      const line = lines[i];

      // Skip blanks at top level.
      // (They are only important inside Markdown!)
      if (isComment(line) || isBlank(line)) {
        i++;
        continue;
      }

      const indentation = spacesPreceding(line);

      // If the line starts with a tag
      if (isTagStart( line )) {
        lexTagLines(line, indentation);
        i++;
      } else {
        // If the line is markdown
        lexMarkdownLines(line, indentation);
        i++;
      }
    }

    return tokenList;
  }
}
