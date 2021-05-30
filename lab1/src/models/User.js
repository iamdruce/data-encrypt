const rsa = require("../RSA");
const uid = require("uuid");

const symmetricFileCypher = require("../cypher");

class Client {
  password = "";
  publicKey;
  privateKey;
  clients = new Map();
  clientsPubKeys = new Map();

  constructor(workDir) {
    const { publicKey: generatedPublicKey, privateKey: generatedPrivateKey } =
      rsa.generate();

    this.name = uid.v4();
    this.workDir = workDir;

    this.publicKey = generatedPublicKey;
    this.privateKey = generatedPrivateKey;
  }

  getName() {
    return this.name;
  }

  onPackageReceive(message) {
    if (message.isKeyExchange && this.isReceiver(message.target)) {
      this.handleKeyReceive(message);
      return;
    }

    this.handle(message);

    if (this.isReceiver(message.target)) {
      return;
    }

    this.send(message);
  }

  connect(client, handler) {
    if (this.clients.has(client)) {
      const handlers = this.clients.get(client);
      this.clients.set(client, [...handlers, handler]);
    }

    this.clients.set(client, [handler]);
  }

  encryptMessage(mess, recPublicKey) {
    return rsa.encrypt(mess, recPublicKey);
  }

  send(packToSend) {
    const availabaleClients = Array.from(this.clients).filter(
      ([client]) => client !== packToSend.recFrom
    );

    availabaleClients.forEach(([, handlers]) =>
      handlers.forEach((handler) => {
        packToSend.recFrom = this.getName();
        handler(packToSend);
      })
    );
  }

  handleKeyReceive(recPackage) {
    const publicKey = recPackage.payload.split(" ").map((value) => BigInt(value));

    this.clientsPubKeys.set(recPackage.from, publicKey);

    console.log(`I (${this.getName()}) have received a public key: "${recPackage.payload}" from ${recPackage.from}.`);
  }

  handle(recPackage) {
    if (!!recPackage.payload && !recPackage.file) {
      this.sendMessage(recPackage);
    }

    if (recPackage.file) {
      this.sendFile(recPackage);
    }
  }

  decryptMessage(mess) {
    return rsa.decrypt(mess, this.privateKey);
  }

  isReceiver(packReceiver) {
    return this.getName() === packReceiver;
  }

  sendMessage(recPackage) {
    const mess = this.isReceiver(recPackage.target)
      ? this.decryptMessage(recPackage.payload)
      : recPackage.payload;

    if (/SECRET: /.test(mess)) {
      const [, password] = mess.split(/SECRET: /g);
      console.log(
        `I (${this.getName()}) have received symmetric secret key from ${recPackage.from}`
      );
      this.password = password;
      return;
    }

    console.log(`Who: ${this.getName()}.
      (Is target? (${this.isReceiver(recPackage.target)})).
      From ${recPackage.from}.
      To: ${recPackage.target}.
      Message: ${ this.isReceiver(recPackage.target) ? this.decryptMessage(recPackage.payload) : recPackage.payload }`);
  }

  sendFile(recPackage) {
    console.log(`Who: ${this.getName()}
                From ${recPackage.from}
                Target: ${recPackage.target}
                Saving ${
                  this.isReceiver(recPackage.target) ? "enc" : "dec"
                } file ${this.workDir}`);

    symmetricFileCypher.sendFile({
      shouldDecrypt: this.isReceiver(recPackage.target),
      buffer: recPackage.file,
      path: this.workDir,
      secretKey: this.password,
    });
  }
}

module.exports = Client;
