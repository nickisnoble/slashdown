import type { SD } from "./types"

const patterns = {
  "Tag": /^\/([\w-]*)/,
  "Id": /^#([\w-]+)/,
  "Class": /^\.([\w-]+)/,
  "Attribute": /^([\w-]+="[^"]*")|^([\w-]+)/,
  "Text": /^=\s+(.+)$/
};

const isComment = (line: string): boolean => !!line.match(/^\s*\/\//);
const isBlank = (line: string): boolean => line.trim() === "";

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
    this.src = src; // update src in case of new input
    const tokenList: SD.Token[] = []; // reset

    let i = 0;
    const lines: string[] = src.split("\n");

    const lookahead = (n: number = 1): string => lines[i + n];
    const isTagStart = (l: string): boolean => l.trim().startsWith('/');


    primary: while (i < lines.length) {
      const line = lines[i];

      // Skip blanks at top level.
      // (They are only important inside Markdown!)
      if (isComment(line) || isBlank(line)) {
        i++;
        continue primary;
      }

      const indentation = spacesPreceding(line);

      if (isTagStart(line)) {
        lexTagLines(line, indentation);
        i++;

      } else {
        lexMarkdownLines(line, indentation);
        i++;
      }
    }

    function lexTagLines(startingLine: string, tagIndentLevel: number): void {
      let remainingText = startingLine.trim();

      // Lex first line
      let matchFound = true; // we have a valid tag, to start
      do {
        matchFound = false;

        typeLoop: for (const type of ["Tag", "Class", "Id", "Attribute", "Text"] as const) {
          const match = remainingText.match(patterns[type]);

          if (match) {
            tokenList.push({
              type,
              content: match[1] ?? match[2] ?? match[0], // Grab the capture group content. Some have multiple possibilities!
              indent: tagIndentLevel
            });

            remainingText = remainingText.slice(match[0].length).trim();
            matchFound = true;
            break typeLoop; // break the for loop and start over because we found a match
          }
        }
      } while (matchFound);

      let nextLine = lookahead(1)
      while (!!nextLine && !isBlank(nextLine) && !isTagStart(nextLine)) {
        nextLine = nextLine.trim()
        let matchFound = false;

        typeLoop: for (const type of ["Class", "Id", "Attribute", "Text"] as const) {
          const match = nextLine.match(
            // TODO: Support multiple selectors on own line, eg #header.flex.justify-between
            new RegExp(
              (patterns[type].source + "$") // check ENTIRE line
              .replace("$$", "$") // (some regex already check for line-end)
            )
          );

          if (match) {
            tokenList.push({
              type,
              content: match[1] ?? match[2] ?? match[0],
              indent: tagIndentLevel
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
      const markdownToken: { type: "Markdown" } & SD.Token = {
        type: "Markdown",
        content: startingLine.trim(),
        indent: startingIndentLevel
      };

      const markdownRemains = () => {
        const nextLine = lookahead(1)
        if (nextLine === undefined) return false;

        const notATag = !isTagStart(nextLine);
        const sameBlock = spacesPreceding(nextLine) >= startingIndentLevel;

        // If the next line:
        // - is not a tag start (/)
        // - has the same or greater indent
        // - or is blank
        // ...consider it a continuation of this markdown.
        return sameBlock && notATag || isBlank(nextLine);
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


      // Remove any trailing newline.
      markdownToken.content = markdownToken.content.trim()

      tokenList.push(markdownToken)
    }
    return tokenList;
  }
}
