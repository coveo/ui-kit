import {logRecommendationOpen} from '../../../features/recommendation/recommendation-analytics-actions';
import {buildMockResult} from '../../../test';
import {
  buildMockRecommendationEngine,
  MockedRecommendationEngine,
} from '../../../test/mock-engine-v2';
import {createMockRecommendationState} from '../../../test/mock-recommendation-state';
import {buildInteractiveResultCore} from '../../core/interactive-result/headless-core-interactive-result';
import {
  buildInteractiveResult,
  RecommendationInteractiveResultProps,
} from './headless-recommendation-interactive-result';

jest.mock('../../core/interactive-result/headless-core-interactive-result');
jest.mock('../../../features/recommendation/recommendation-analytics-actions');

describe('RecommendationInteractiveResult', () => {
  let engine: MockedRecommendationEngine;
  let interactiveResultProps: RecommendationInteractiveResultProps;
  let mockedBuildInteractiveResultCore: jest.Mock;
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
    jest.resetAllMocks();
    mockedBuildInteractiveResultCore = jest.mocked(buildInteractiveResultCore);
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
    const mockedLogDocumentSuggestionOpen = jest.mocked(logRecommendationOpen);

    mockedSelect();
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledTimes(1);
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledWith(
      interactiveResultProps.options.result
    );
  });

  it('does not call #logRecommendationOpen when the action is triggered for the second time', () => {
    const mockedLogDocumentSuggestionOpen = jest.mocked(logRecommendationOpen);

    mockedSelect();
    mockedSelect();
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledTimes(1);
  });
});
