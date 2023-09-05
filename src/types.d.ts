const TOKEN_TYPES = ["Tag", "Attribute", "Id", "Class", "Text", "Markdown"] as const;

export declare namespace Slashdown {
  type TokenType = typeof TOKEN_TYPES[number];

  type Token = {
    type: TokenType,
    content: string,
    indent: number
  }
}