class Token {
  constructor (type, lexeme, literal, location) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.location = location;
  }
}

export default Token;