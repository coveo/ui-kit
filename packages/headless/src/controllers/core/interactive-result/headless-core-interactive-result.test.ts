import type {Mock} from 'vitest';
import {configuration} from '../../../app/common-reducers.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
} from './headless-core-interactive-result.js';

describe('InteractiveResultCore', () => {
  let engine: MockedSearchEngine;
  let interactiveResultCore: InteractiveResultCore;
  let actionSpy: Mock;

  function initializeInteractiveResultCore(delay?: number) {
    interactiveResultCore = buildInteractiveResultCore(
      engine,
      {
        options: {selectionDelay: delay},
      },
      actionSpy
    );
  }

  beforeEach(() => {
    actionSpy = vi.fn();
    engine = buildMockSearchEngine(createMockState());
    initializeInteractiveResultCore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      vi.advanceTimersByTime(selectDelay - 1);

      expect(actionSpy).not.toHaveBeenCalled();
    });

    it('when calling beginDelayedSelect(), executes action after the delay', () => {
      interactiveResultCore.beginDelayedSelect();
      vi.advanceTimersByTime(selectDelay);

      expect(actionSpy).toHaveBeenCalled();
    });

    it("when calling beginDelayedSelect(), doesn't execute action after the delay if cancelPendingSelect() was called", () => {
      interactiveResultCore.beginDelayedSelect();
      vi.advanceTimersByTime(selectDelay - 1);
      interactiveResultCore.cancelPendingSelect();
      vi.advanceTimersByTime(1);

      expect(actionSpy).not.toHaveBeenCalled();
    });
  });
});
