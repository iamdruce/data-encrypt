const fs = require("fs").promises;
const crypto = require("crypto");
const rsa = require("./RSA");

class SymmFileCypher {
  iv = crypto.randomBytes(16);
  algorithm = "aes-256-cbc";
  secretKey = process.env.SECRET_KEY;

  encrypt(buffer) {
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);

    return Buffer.concat([cipher.update(buffer), cipher.final()]);
  }

  sendFile({ shouldDecrypt, buffer, path }) {
    shouldDecrypt
      ? this.saveWithDecryption(path, buffer, this.secretKey)
      : this.saveWithoutDecryption(path, buffer);
  }

  encryptKeyForSending(asymmetricPublicKey) {
    return rsa.encrypt(`SECRET: ${this.secretKey}`, asymmetricPublicKey);
  }

  async saveWithoutDecryption(folderPath, buffer) {
    const path = `${folderPath}/lab1-enc.docx`;
    await fs.writeFile(path, buffer, "utf-8");
  }

  decrypt(buffer, privateKey) {
    const decipher = crypto.createDecipheriv(this.algorithm, privateKey, this.iv);

    return Buffer.concat([decipher.update(buffer), decipher.final()]);
  }

  async saveWithDecryption(folderPath, buffer, privateKey) {
    const decryptedBuffer = this.decrypt(buffer, privateKey);
    const path = `${folderPath}/lab1-dec.docx`;

    await fs.writeFile(path, decryptedBuffer, "utf-8");
  }
}

module.exports = new SymmFileCypher();
