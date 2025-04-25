module.exports = async () => {
  // Mocking the ShadowRoot class to avoid errors in tests
  globalThis.ShadowRoot = class ShadowRoot {};
  // TODO: get rid of the mock once no longer running stencil tests
  jest.mock('../src/utils/stencil-resource-url');
};
