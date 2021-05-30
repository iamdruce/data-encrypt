var util = require("util");
var fs = require("fs");
const readFileContent = util.promisify(fs.readFile);
require("dotenv").config();

const User = require("./models/User");
const Message = require("./models/Message");
const symmetricFileCypher = require("./cypher");

const firstClient = new User("src/data/user1");
const secondClient = new User("src/data/user2");
const thirdClient = new User("src/data/user3");
const fourthClient = new User("src/data/user4");

const getConnections = () => {
  firstClient.connect(secondClient.getName(), (data) =>
    secondClient.onPackageReceive(data)
  );

  secondClient.connect(thirdClient.getName(), (data) =>
    thirdClient.onPackageReceive(data)
  );

  thirdClient.connect(secondClient.getName(), (data) =>
    secondClient.onPackageReceive(data)
  );

  secondClient.connect(firstClient.getName(), (data) =>
    firstClient.onPackageReceive(data)
  );

  secondClient.connect(fourthClient.getName(), (data) =>
    fourthClient.onPackageReceive(data)
  );

  fourthClient.connect(secondClient.getName(), (data) =>
    secondClient.onPackageReceive(data)
  );
};

const firstAndThirdKeysChange = () => {
  const publicKeyFromFirstToThird = new Message(
    firstClient.getName(),
    thirdClient.getName(),
    firstClient.publicKey.join(" "),
    null,
    true
  );

  console.log(publicKeyFromFirstToThird);

  firstClient.send(publicKeyFromFirstToThird);

  const publicKeyFromThirdToFirst = new Message(
    thirdClient.getName(),
    firstClient.getName(),
    thirdClient.publicKey.join(" "),
    null,
    true
  );
  console.log(publicKeyFromThirdToFirst);

  thirdClient.send(publicKeyFromThirdToFirst);
};

const thirdToFirstSendMessage = () => {
  const mess = thirdClient.encryptMessage(
    "Hello from client3",
    thirdClient.clientsPubKeys.get(firstClient.getName())
  );

  const messageBetweenThirdAndFirst = new Message(
    thirdClient.getName(),
    firstClient.getName(),
    mess
  );
  console.log(messageBetweenThirdAndFirst);

  thirdClient.send(messageBetweenThirdAndFirst);
};

const secondAndFourthSendMessage = () => {
  const publicKeyFromSecondToFourth = new Message(
    secondClient.getName(),
    fourthClient.getName(),
    secondClient.publicKey.join(" "),
    null,
    true
  );
  console.log(publicKeyFromSecondToFourth);

  secondClient.send(publicKeyFromSecondToFourth);

  const publicKeyFromFourthToSecond = new Message(
    fourthClient.getName(),
    secondClient.getName(),
    fourthClient.publicKey.join(" "),
    null,
    true
  );
  console.log(publicKeyFromFourthToSecond);

  fourthClient.send(publicKeyFromFourthToSecond);

  const mess = secondClient.encryptMessage(
    "Hello from client2",
    secondClient.clientsPubKeys.get(fourthClient.getName())
  );

  const messageBetweenSecondAndFourth = new Message(
    secondClient.getName(),
    fourthClient.getName(),
    mess
  );
  console.log(messageBetweenSecondAndFourth);

  secondClient.send(messageBetweenSecondAndFourth);
};

const firstAndThirdSendMessage = () => {
  const messageBetweenFirstAndThird = new Message(
    firstClient.getName(),
    thirdClient.getName(),
    firstClient.encryptMessage(
      "Hi from client1",
      firstClient.clientsPubKeys.get(thirdClient.getName())
    )
  );
  console.log(messageBetweenFirstAndThird);
  firstClient.send(messageBetweenFirstAndThird);
};

const firstAndThirdSendFile = async () => {

  const sendingSymmetricKeyForFileDecryption = new Message(
    firstClient.getName(),
    thirdClient.getName(),
    symmetricFileCypher.encryptKeyForSending(
      firstClient.clientsPubKeys.get(thirdClient.getName())
    )
  );
  console.log(sendingSymmetricKeyForFileDecryption);
  firstClient.send(sendingSymmetricKeyForFileDecryption);

  const buffer = await readFileContent(`${firstClient.workDir}/lab1.docx`);
  const encryptedBuffer = symmetricFileCypher.encrypt(buffer);

  const fileTransferFromFirstAndThird = new Message(
    firstClient.getName(),
    thirdClient.getName(),
    null,
    encryptedBuffer
  );
  console.log(fileTransferFromFirstAndThird);
  firstClient.send(fileTransferFromFirstAndThird);
};

getConnections();
firstAndThirdKeysChange();
firstAndThirdSendFile();
thirdToFirstSendMessage();
secondAndFourthSendMessage();
firstAndThirdSendMessage();
