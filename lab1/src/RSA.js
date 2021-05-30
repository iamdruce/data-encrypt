const maxIterations = 100000;
const untilNumber = 250;

class RSA {
  primeNumbers = [...this.generatePrimeNumbers(untilNumber)];

  isPrime(n) {
    if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) return false;
    if (n === this.leastFactor(n)) return true;
    return false;
  }

  leastFactor(n) {
    if (isNaN(n) || !isFinite(n)) return NaN;
    if (n == 0) return 0;
    if (n % 1 || n * n < 2) return 1;
    if (n % 2 == 0) return 2;
    if (n % 3 == 0) return 3;
    if (n % 5 == 0) return 5;
    var m = Math.sqrt(n);
    for (var i = 7; i <= m; i += 30) {
      if (n % i == 0) return i;
      if (n % (i + 4) == 0) return i + 4;
      if (n % (i + 6) == 0) return i + 6;
      if (n % (i + 10) == 0) return i + 10;
      if (n % (i + 12) == 0) return i + 12;
      if (n % (i + 16) == 0) return i + 16;
      if (n % (i + 22) == 0) return i + 22;
      if (n % (i + 24) == 0) return i + 24;
    }
    return n;
  }

  generate() {
    const [p, q] = [
      this.primeNumbers[Math.floor(Math.random() * this.primeNumbers.length)],
      this.primeNumbers[Math.floor(Math.random() * this.primeNumbers.length)],
    ];
    const n = BigInt(p) * BigInt(q);

    const phi = BigInt((p - 1) * (q - 1));
    const [...fermatArray] = this.ferma(phi);
    const e = fermatArray.find(
      (value) => BigInt(value) > 1 && value < phi && this.isCoprime(value, phi)
    );
    const d = this.findD(e, phi);

    return { publicKey: [e, n], privateKey: [d, n] };
  }

  encrypt(mess, publicKey) {
    const [e, n] = publicKey;
    const messageCharCodes = mess.split("").map((char) => char.charCodeAt(0));
    const encrypted = messageCharCodes.map((charCode) =>
      Number(BigInt(charCode) ** BigInt(e) % BigInt(n))
    );

    return encrypted.join(" ");
  }

  decrypt(mess, privateKey) {
    const [d, n] = privateKey;
    const decryptedCodes = mess
      .split(" ")
      .map((charCode) => Number(BigInt(charCode) ** BigInt(d) % BigInt(n)));

    return String.fromCharCode(...decryptedCodes);
  }

  *ferma(maximum) {
    let currentNumber = BigInt(0);
    let iteration = BigInt(0);

    while (true) {
      currentNumber = BigInt(BigInt(2) ** (BigInt(2) ** iteration) + BigInt(1));
      iteration++;

      if (currentNumber < maximum) {
        yield currentNumber;
      } else {
        return;
      }
    }
  }

  findD(e, phi) {
    let d = BigInt(1);

    while (d < maxIterations) {
      let y = BigInt(e) * BigInt(d);

      if (BigInt(y) % BigInt(phi) === BigInt(1)) {
        return BigInt(d);
      }

      d = BigInt(d) + BigInt(1);
    }
  }

  isCoprime(a, b) {
    let num;

    while (b) {
      num = BigInt(a) % BigInt(b);
      a = b;
      b = num;
    }

    if (Math.abs(Number(a)) == 1) {
      return true;
    }

    return false;
  }

  generatePrimeNumbers(n) {
    let ret = [];
    let currentNumber = 2;

    while (currentNumber <= n) {
      if (this.isPrime(currentNumber)) {
        ret.push(currentNumber);
      }
      currentNumber++;
    }

    return ret;
  }

}

module.exports = new RSA();
