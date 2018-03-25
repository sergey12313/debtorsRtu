class RtuXmlError extends Error {
  constructor(message, code) {
    super(message);
    if (code) {
      this.code = code;
    }
    this.name = "RtuXmlError";
  }
}

module.exports = RtuXmlError;
