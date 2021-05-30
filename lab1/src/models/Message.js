module.exports = class Message {
  constructor(
    from,
    target,
    payload,
    file = null,
    isKeyExchange = false
  ) {
    this.target = target;
    this.from = from;
    this.file = file;
    this.isKeyExchange = isKeyExchange;
    this.payload = payload;
  }
}
