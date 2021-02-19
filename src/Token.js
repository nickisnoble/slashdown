class Token {
  constructor (type, value, location) {
    this.type = type;
    this.value = value;
    this.location = location;
  }
}

export default Token;