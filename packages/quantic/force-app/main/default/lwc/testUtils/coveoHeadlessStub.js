export class MockEngine {
  static getSampleConfiguration() {
    return {}
  }
}

export const CoveoHeadlessStub = {
  HeadlessEngine: MockEngine,
  SearchActions: {
    executeSearch: () => {}
  },
  AnalyticsActions: {
    logInterfaceLoad: () => {}
  }
}