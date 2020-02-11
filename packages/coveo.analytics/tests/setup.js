const nodeCrypto = require('crypto');
global.crypto = {
    getRandomValues: (buffer) => nodeCrypto.randomFillSync(buffer)
};

Object.defineProperty(document, 'referrer', {
    value: 'http://somewhere.over/therainbow',
});
Object.defineProperty(document, 'title', {
    value: 'MAH PAGE',
});
Object.defineProperty(document, 'characterSet', {
    value: 'UTF-8',
});
