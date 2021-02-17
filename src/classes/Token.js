class Token {
  constructor (type, text, location) {
    this.type = type;
    this.text = text;
    this.location = location;
  }

  hasChild( otherToken ) {
    return this.location.indent < otherToken.location.indent;
  }

  isSibling( otherToken ) {
    return this.location.indent == otherToken.location.indent;
  }
}

export default Token;