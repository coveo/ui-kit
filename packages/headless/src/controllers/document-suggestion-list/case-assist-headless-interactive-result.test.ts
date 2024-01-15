import {logDocumentSuggestionOpen} from '../../features/case-assist/case-assist-analytics-actions';
import {buildMockResult} from '../../test';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state';
import {
  buildMockCaseAssistEngine,
  MockedCaseAssistEngine,
} from '../../test/mock-engine-v2';
import {buildInteractiveResultCore} from '../core/interactive-result/headless-core-interactive-result';
import {
  buildCaseAssistInteractiveResult,
  CaseAssistInteractiveResultProps,
} from './case-assist-headless-interactive-result';

jest.mock('../core/interactive-result/headless-core-interactive-result');
jest.mock('../../features/case-assist/case-assist-analytics-actions');

describe('InteractiveResult', () => {
  let engine: MockedCaseAssistEngine;
  let interactiveResultProps: CaseAssistInteractiveResultProps;
  let mockedBuildInteractiveResultCore: jest.Mock;
  const resultStringParams = {
    uniqueId: 'unique-id',
  };

  function initializeInteractiveResult(delay?: number) {
    const result = buildMockResult(resultStringParams);
    interactiveResultProps = {
      options: {result, selectionDelay: delay},
    };
    buildCaseAssistInteractiveResult(engine, interactiveResultProps);
  }

  function initEngine(preloadedState = buildMockCaseAssistState()) {
    engine = buildMockCaseAssistEngine(preloadedState);
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

  it('initialize a interactive result core with the correct options', () => {
    expect(mockedBuildInteractiveResultCore).toHaveBeenCalledWith(
      engine,
      interactiveResultProps,
      expect.any(Function)
    );
  });

  it('dispatches #logDocumentSuggestionOpen when the action is triggered for the first time', () => {
    const mockedLogDocumentSuggestionOpen = jest.mocked(
      logDocumentSuggestionOpen
    );

    mockedSelect();
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledTimes(1);
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledWith(
      resultStringParams.uniqueId
    );
  });

  it('does not dispatch logDocumentSuggestionOpen when the action is triggered for the second time', () => {
    const mockedLogDocumentSuggestionOpen = jest.mocked(
      logDocumentSuggestionOpen
    );

    mockedSelect();
    mockedSelect();
    expect(mockedLogDocumentSuggestionOpen).toHaveBeenCalledTimes(1);
  });
});
