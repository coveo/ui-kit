// Cross-fetch mock bridge for jest tests.
// TS6 compiles `import * as X from 'cross-fetch'` using __importStar, which
// creates non-configurable property descriptors. This prevents jest.spyOn from
// redefining `fetch`. Instead, this mock bridge uses a getter that dynamically
// returns the current mock (or the real fetch if no mock is set).

let _currentMock = null;

const actual = require('cross-fetch/dist/node-ponyfill.js');

function setFetchMock(mock) {
  _currentMock = mock;
}

function getFetchMock() {
  return _currentMock;
}

module.exports = {
  ...actual,
  get fetch() {
    return _currentMock || actual.fetch;
  },
  setFetchMock,
  getFetchMock,
};
