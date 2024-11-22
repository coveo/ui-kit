// Shim globalThis because Salesforce Locker Service doesn't support it.
const globalThisShim = window;

export {globalThisShim as globalThis};
