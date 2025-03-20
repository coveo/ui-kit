import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state.js';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildSmartSnippet,
  SmartSnippetProps,
} from './headless-smart-snippet.js';

describe('smart snippet', () => {
  let engine: MockedSearchEngine;

  function initSmartSnippet(props: SmartSnippetProps = {}) {
    buildSmartSnippet(engine, props);
  }

  describe('building the controller with the next analytics mode', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({analyticsMode: 'next'}),
          },
        })
      );
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should log a warning when the controller is used with the next analytics mode', () => {
      initSmartSnippet();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        '[Warning] A component from the Coveo Headless library has been instantiated with the Analytics Mode: "Next".\n' +
          'However, this mode is not available for Coveo for Service features, and this configuration may not work as expected.\n' +
          'Please switch back to the "legacy" analytics mode to ensure proper functionality.\n' +
          'For more information, refer to the documentation: https://docs.coveo.com/en/o3r90189/build-a-search-ui/event-protocol'
      );
    });
  });

  describe('building the controller with the legacy analytics mode', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({analyticsMode: 'legacy'}),
          },
        })
      );
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should not log a warning when the controller is used with the legacy analytics mode', () => {
      initSmartSnippet();
      expect(warnSpy).toHaveBeenCalledTimes(0);
    });
  });
});
