module.exports = async () => {
  // Mocking the ShadowRoot class to avoid errors in tests
  globalThis.ShadowRoot = class ShadowRoot {};
};
