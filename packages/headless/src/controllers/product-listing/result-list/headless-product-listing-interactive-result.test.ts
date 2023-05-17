import {Result} from '../../../api/search/search/result';
import {configuration} from '../../../app/common-reducers';
import {logDocumentOpen} from '../../../features/product-listing/product-listing-analytics';
import {pushRecentResult} from '../../../features/recent-results/recent-results-actions';
import {buildMockResult} from '../../../test';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-product-listing-interactive-result';

describe('InteractiveResult', () => {
  let engine: MockProductListingEngine;
  let mockResult: Result;
  let interactiveResult: InteractiveResult;
  let logDocumentOpenPendingActionType: string;

  const resultStringParams = {
    title: 'title',
    uri: 'uri',
    printableUri: 'printable-uri',
    clickUri: 'click-uri',
    uniqueId: 'unique-id',
    excerpt: 'exceprt',
    firstSentences: 'first-sentences',
    flags: 'flags',
  };

  function initializeInteractiveResult(delay?: number) {
    const result = (mockResult = buildMockResult(resultStringParams));
    logDocumentOpenPendingActionType = logDocumentOpen(mockResult).pending.type;
    interactiveResult = buildInteractiveResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  function findLogDocumentAction() {
    return (
      engine.actions.find(
        (action) => action.type === logDocumentOpenPendingActionType
      ) ?? null
    );
  }

  function expectLogDocumentActionPending() {
    const action = findLogDocumentAction();
    expect(action).toEqual(
      logDocumentOpen(mockResult).pending(action!.meta.requestId)
    );
  }

  beforeEach(() => {
    engine = buildMockProductListingEngine();
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select() should add the result to recent results list', () => {
    interactiveResult.select();
    jest.runAllTimers();

    expect(
      engine.actions.find((a) => a.type === pushRecentResult.type)
    ).toBeDefined();
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });
});
