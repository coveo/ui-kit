import {nextAnalyticsUsageWithServiceFeatureWarning} from '../../app/engine.js';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import type {SmartSnippetQuestionsListProps} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list.js';
import {buildSmartSnippetQuestionsList} from './headless-smart-snippet-questions-list.js';

describe('smart snippet', () => {
  let engine: MockedSearchEngine;

  function initSmartSnippet(props: SmartSnippetQuestionsListProps = {}) {
    buildSmartSnippetQuestionsList(engine, props);
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
        nextAnalyticsUsageWithServiceFeatureWarning
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
