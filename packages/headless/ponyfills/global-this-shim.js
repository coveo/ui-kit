// Shim globalThis because Salesforce Locker Service doesn't support it.
const globalThisShim = typeof globalThis !== 'undefined' ? globalThis : window;

export {globalThisShim as globalThis};
