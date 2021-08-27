import {configuration} from '../../../app/reducers';
import {buildMockResult} from '../../../test';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
} from './headless-core-interactive-result';

describe('InteractiveResultCore', () => {
  let engine: MockSearchEngine;
  let interactiveResultCore: InteractiveResultCore;
  let actionSpy: jest.Mock;

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

  function initializeInteractiveResultCore(delay?: number) {
    const result = buildMockResult(resultStringParams);
    interactiveResultCore = buildInteractiveResultCore(
      engine,
      {
        options: {result, selectionDelay: delay},
      },
      actionSpy
    );
  }

  beforeEach(() => {
    actionSpy = jest.fn();
    engine = buildMockSearchAppEngine();
    initializeInteractiveResultCore();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select() should call the given action', () => {
    interactiveResultCore.select();

    expect(actionSpy).toHaveBeenCalled();
  });

  describe('with a delay', () => {
    const selectDelay = 2;
    beforeEach(() => {
      initializeInteractiveResultCore(selectDelay);
    });

    it("when calling beginDelayedSelect(), doesn't execute action before the delay", () => {
      interactiveResultCore.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);

      expect(actionSpy).not.toHaveBeenCalled();
    });

    it('when calling beginDelayedSelect(), executes action after the delay', () => {
      interactiveResultCore.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay);

      expect(actionSpy).toHaveBeenCalled();
    });

    it("when calling beginDelayedSelect(), doesn't execute action after the delay if cancelPendingSelect() was called", () => {
      interactiveResultCore.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      interactiveResultCore.cancelPendingSelect();
      jest.advanceTimersByTime(1);

      expect(actionSpy).not.toHaveBeenCalled();
    });
  });
});
