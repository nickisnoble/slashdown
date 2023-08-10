type Token = {
  type: "TAG" | "ATTRIBUTE" | "ID" | "CLASS" | "TEXT" | "MARKDOWN",
  content: string,
  indent: number
}

type TagToken = { type: "TAG" } & Token
type AttributeToken = { type: "ATTRIBUTE" } & Token
type IdToken = { type: "ID" } & Token
type ClassToken = { type: "CLASS" } & Token
type TextToken = { type: "TEXT" } & Token
type MarkdownToken = { type: "MARKDOWN" } & Token

const patterns: [string, RegExp][] = [
  ["TAG", /^\/([\w-]*)/],
  ["ID", /^(#[\w-]+)/],
  ["CLASS", /^(\.[\w-]+)/],
  ["ATTRIBUTE", /^([\w-]+="[^"]*")|^([\w-]+)/],
  ["TEXT", /^=\s+(.+)$/]
];

const isComment = (line: string): boolean => !!line.match(/^\s*\/\//)
const isBlank = (line: string): boolean => line.trim() === ""

const spacesPreceding = ( line: string ): number => {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}


export function lex(src: string) {
  const lines: string[] = src.split("\n");
  let blankSinceLastTag = false;

  for(const line of lines) {
    if( isComment(line) ) continue;

    const indentation = spacesPreceding( line );
  }

  return lines;
}
