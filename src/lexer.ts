import type { SD } from "./types"

// Constants
const MAX_DEPTH = 100;
const MAX_LINE_LENGTH = 10000;

const patterns = {
  "Tag": /^\/([\w-]*)/,
  "Id": /^#([\w-]+)/,
  "Class": /^\.([\w-]+)/,
  "Attribute": /^([\w-]+="[^"]*")|^([\w-]+)/,
  "Text": /^=\s+(.+)$/,
  "CodeFence": /^`{3}([\w-]+)?$/
};

// Pre-compiled patterns for end-of-line matching
const eolPatterns = {
  "Class": /^\.([\w-]+)$/,
  "Id": /^#([\w-]+)$/,
  "Attribute": /^([\w-]+="[^"]*")$|^([\w-]+)$/,
  "Text": /^=\s+(.+)$/
};

const isComment    = (l: string): boolean => !!l.match(/^\s*\/\//);
const isBlank      = (l: string): boolean => l.trim() === "";
const isTagStart   = (l: string): boolean => l.trim().startsWith('/');
const isFenceStart = (l: string): boolean => l.trim().startsWith('```');

const spacesPreceding = (line: string): number => {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

export class Lexer {
  src: string;

  constructor(src: string = "") {
    this.src = src;
  }

  tokens(src: string = this.src): SD.Token[] {
    if (typeof src !== 'string') {
      throw new Error('Lexer input must be a string');
    }

    this.src = src; // update src in case of new input
    const tokenList: SD.Token[] = []; // reset

    let i = 0;
    const lines: string[] = src.split("\n");

    const lookahead = (n: number = 1): string => lines[i + n];

    // Helper to get current line number (1-indexed for unist)
    const currentLine = (): number => i + 1;

    primary: while (i < lines.length) {
      const line = lines[i];

      if (line.length > MAX_LINE_LENGTH) {
        throw new Error(`Line ${currentLine()} exceeds maximum length of ${MAX_LINE_LENGTH} characters`);
      }

      // Skip blanks at top level.
      // (They are only important inside Markdown!)
      if (isComment(line) || isBlank(line)) {
        i++;
        continue primary;
      }

      const indentation = spacesPreceding(line);

      if (indentation > MAX_DEPTH * 2) {
        throw new Error(`Line ${currentLine()} has excessive indentation (depth > ${MAX_DEPTH})`);
      }

      if (isTagStart(line)) {
        lexTagLines(line, indentation);
      } else if ( isFenceStart(line)) {
        lexCodeFence(line, indentation);
      } else {
        lexMarkdownLines(line, indentation);
      }

      i++;
    }

    function lexTagLines(startingLine: string, tagIndentLevel: number): void {
      let remainingText = startingLine.trim();
      const startLine = currentLine();
      let currentColumn = tagIndentLevel + 1; // 1-indexed column position

      // Lex first line
      let matchFound = true; // we have a valid tag, to start
      do {
        matchFound = false;

        typeLoop: for (const type of ["Tag", "Class", "Id", "Attribute", "Text"] as const) {
          const match = remainingText.match(patterns[type]);

          if (match) {
            const tokenStartColumn = currentColumn;
            const matchLength = match[0].length;

            tokenList.push({
              type,
              content: match[1] ?? match[2] ?? match[0], // Grab the capture group content. Some have multiple possibilities!
              indent: tagIndentLevel,
              line: startLine,
              column: tokenStartColumn,
            });

            currentColumn += matchLength + 1; // +1 for the space between tokens
            remainingText = remainingText.slice(matchLength).trim();
            matchFound = true;
            break typeLoop; // break the for loop and start over because we found a match
          }
        }
      } while (matchFound);

      let nextLine = lookahead(1)
      while (!!nextLine && !isBlank(nextLine) && !isTagStart(nextLine)) {
        nextLine = nextLine.trim()
        let matchFound = false;
        let lineColumn = tagIndentLevel + 1;

        typeLoop: for (const type of ["Class", "Id", "Attribute", "Text"] as const) {
          const match = nextLine.match(eolPatterns[type]);

          if (match) {
            tokenList.push({
              type,
              content: match[1] ?? match[2] ?? match[0],
              indent: tagIndentLevel,
              line: i + 2, // +1 for next line, +1 for 1-indexed
              column: lineColumn,
            })

            nextLine = nextLine.slice(match[0].length).trim(); // remove the matched part from nextLine
            matchFound = true;
            break typeLoop;
          }
        }

        if (!matchFound) {
          break; // if no match was found, break the while loop
        }

        i++; // count the line since it was valid
        nextLine = lookahead(1); // update nextLine for the next iteration
      }
    }

    function lexMarkdownLines(startingLine: string, startingIndentLevel: number): void {
      const startLine = currentLine();
      const markdownToken: { type: "Markdown" } & SD.Token = {
        type: "Markdown",
        content: startingLine.trim(),
        indent: startingIndentLevel,
        line: startLine,
        column: startingIndentLevel + 1,
      };

      const markdownRemains = () => {
        const nextLine = lookahead(1)
        if (nextLine === undefined) return false;

        const notATag = !isTagStart(nextLine);
        const notAFence = !isFenceStart(nextLine);
        const sameBlock = spacesPreceding(nextLine) >= startingIndentLevel;

        // If the next line:
        // - is not a tag start (/)
        // - has the same or greater indent
        // - or is blank
        // ...consider it a continuation of this markdown.
        return sameBlock && notATag && notAFence || isBlank(nextLine);
      }

      while (markdownRemains()) {
        i++; // count the line
        const line = lines[i];

        if (isBlank(line)) {
          markdownToken.content += "\n";
          continue;
        }

        const dedentedLine = line.slice(spacesPreceding(line));
        markdownToken.content += "\n" + dedentedLine;
      }

      // Track end position
      markdownToken.endLine = currentLine();
      markdownToken.endColumn = lines[i].length + 1;

      // Remove any trailing newline.
      markdownToken.content = markdownToken.content.trim()

      tokenList.push(markdownToken)
    }

    function lexCodeFence(startingLine: string, startingIndentLevel: number): void {
      const startLine = currentLine();
      const codefenceToken: { type: "CodeFence" } & SD.Token = {
        type: "CodeFence",
        content: startingLine.trim(),
        indent: startingIndentLevel,
        line: startLine,
        column: startingIndentLevel + 1,
      };



      const preformattedContentRemains = () => {
        const nextLine = lookahead(1)
        if (nextLine === undefined) return false;
        const closing = nextLine.match(patterns["CodeFence"]);
        const sameBlock = spacesPreceding(nextLine) >= startingIndentLevel;

        if (closing) {
          i++;
          return false;
        }

        return !closing && sameBlock || isBlank(nextLine);
      }

      while (preformattedContentRemains()) {
        i++; // count the line
        const line = lines[i];

        if (isBlank(line)) {
          codefenceToken.content += "\n";
          continue;
        }

        const dedentedLine = line.slice(spacesPreceding(line));
        codefenceToken.content += "\n" + dedentedLine;
      }

      // Track end position
      codefenceToken.endLine = currentLine();
      codefenceToken.endColumn = lines[i].length + 1;

      // Remove any trailing newline.
      codefenceToken.content = codefenceToken.content.trim()

      tokenList.push(codefenceToken)
    }
    return tokenList;
  }
}
