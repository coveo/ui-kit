import type {Mock} from 'vitest';
import {logRecommendationOpen} from '../../../features/recommendation/recommendation-analytics-actions.js';
import {
  buildMockRecommendationEngine,
  type MockedRecommendationEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockRecommendationState} from '../../../test/mock-recommendation-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {buildInteractiveResultCore} from '../../core/interactive-result/headless-core-interactive-result.js';
import {
  buildInteractiveResult,
  type RecommendationInteractiveResultProps,
} from './headless-recommendation-interactive-result.js';

vi.mock('../../core/interactive-result/headless-core-interactive-result');
vi.mock('../../../features/recommendation/recommendation-analytics-actions');

describe('RecommendationInteractiveResult', () => {
  let engine: MockedRecommendationEngine;
  let interactiveResultProps: RecommendationInteractiveResultProps;
  let mockedBuildInteractiveResultCore: Mock;
  const resultStringParams = {
    uniqueId: 'unique-id',
  };

  function initializeInteractiveResult(delay?: number) {
    const result = buildMockResult(resultStringParams);
    interactiveResultProps = {
      options: {result, selectionDelay: delay},
    };
    buildInteractiveResult(engine, interactiveResultProps);
  }

  function initEngine(preloadedState = createMockRecommendationState()) {
    engine = buildMockRecommendationEngine(preloadedState);
  }

  function mockedSelect() {
    mockedBuildInteractiveResultCore.mock.calls[0][2]();
  }

  beforeEach(() => {
    vi.resetAllMocks();
    mockedBuildInteractiveResultCore = vi.mocked(buildInteractiveResultCore);
    initEngine();
    initializeInteractiveResult();
  });

  it('initialize an interactive result core with the correct options', () => {
    expect(mockedBuildInteractiveResultCore).toHaveBeenCalledWith(
      engine,
      interactiveResultProps,
      expect.any(Function)
    );
  });

  it('calls logRecommendationOpen when the action is triggered for the first time', () => {
    const mockedLogDocumentSuggestionOpen = vi.mocked(logRecommendationOpen);

    mockedSelect();
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledTimes(1);
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledWith(
      interactiveResultProps.options.result
    );
  });

  it('does not call #logRecommendationOpen when the action is triggered for the second time', () => {
    const mockedLogDocumentSuggestionOpen = vi.mocked(logRecommendationOpen);

    mockedSelect();
    mockedSelect();
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledTimes(1);
  });
});
