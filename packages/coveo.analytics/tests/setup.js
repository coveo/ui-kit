const nodeCrypto = require('crypto');
global.crypto = {
    getRandomValues: (buffer) => nodeCrypto.randomFillSync(buffer),
};

const documentMock = {
    referrer: 'http://somewhere.over/thereferrer',
    title: 'MAH PAGE',
    characterSet: 'UTF-8',
};

Object.keys(documentMock).forEach((key) => Object.defineProperty(document, key, {value: documentMock[key]}));
