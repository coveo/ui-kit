function buildSearchEngine() {
  return {
    executeFirstSearch: jest.fn(() => {})
  }
}

export const CoveoHeadlessStub = {buildSearchEngine}
