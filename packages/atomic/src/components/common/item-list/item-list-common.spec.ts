import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {CommerceStore} from '@/src/components/commerce/atomic-commerce-interface/store';
import {
  type FocusTargetController,
  getFirstFocusableDescendant,
} from '@/src/utils/accessibility-utils';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {defer} from '@/src/utils/utils';
import {ItemListCommon, type ItemListCommonProps} from './item-list-common';

vi.mock('@/src/utils/accessibility-utils', {spy: true});
vi.mock('@/src/utils/replace-breakpoint-utils', {spy: true});
vi.mock('@/src/utils/utils', async () => {
  const actual = await vi.importActual('@/src/utils/utils');
  return {
    ...actual,
    defer: vi.fn(async () => {
      return new Promise((resolve) => resolve(true));
    }),
  };
});

describe('ItemListCommon', () => {
  const baseNextNewItemTarget = {
    focus: vi.fn(),
    focusAfterSearch: vi.fn(),
    focusOnNextTarget: vi.fn(),
    registerFocusCallback: vi.fn(),
    setTarget: vi.fn(),
  };
  describe('#constructor', () => {
    it('should create an instance', () => {
      const itemListCommon = itemListCommonFixture();

      expect(itemListCommon).toBeInstanceOf(ItemListCommon);
    });

    it('should call #props.store.setLoadingFlag with #props.loadingFlag', () => {
      const setLoadingFlag = vi.fn();

      itemListCommonFixture({
        loadingFlag: 'test-loading-flag',
        store: fakeStore({setLoadingFlag}),
      });

      expect(setLoadingFlag).toHaveBeenCalledOnce();
      expect(setLoadingFlag).toHaveBeenCalledWith('test-loading-flag');
    });

    it('should set #props.store.state.resultList to the instance', () => {
      const store = fakeStore();

      const itemListCommon = itemListCommonFixture({store});

      expect(store.state.resultList).toBe(itemListCommon);
    });

    it('should register a focus callback that resets indexOfResultToFocus', () => {
      const registerFocusCallback = vi.fn();
      const nextNewItemTarget = {
        ...baseNextNewItemTarget,
        registerFocusCallback,
      } as unknown as FocusTargetController;

      itemListCommonFixture({nextNewItemTarget});

      expect(registerFocusCallback).toHaveBeenCalledOnce();
      expect(registerFocusCallback).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('#updateBreakpoints', () => {
    it('should call the #updateBreakpoints util function with #props.host only once', () => {
      const mockedUpdateBreakpoints = vi.mocked(updateBreakpoints);
      const host = document.createElement('span');

      const itemListCommon = itemListCommonFixture({host});

      expect(mockedUpdateBreakpoints).not.toHaveBeenCalled();

      itemListCommon.updateBreakpoints();
      itemListCommon.updateBreakpoints();

      expect(mockedUpdateBreakpoints).toHaveBeenCalledOnce();
      expect(mockedUpdateBreakpoints).toHaveBeenCalledWith(host);
    });
  });

  describe('#getResultId', () => {
    it('should return the correct value', () => {
      const itemListCommon = itemListCommonFixture();

      const resultId = itemListCommon.getResultId(
        'uniqueId123',
        'searchResponseId456',
        'comfortable',
        'large'
      );

      // eslint-disable-next-line @cspell/spellchecker
      expect(resultId).toBe('uniqueId123searchResponseId456comfortablelarge');
    });
  });

  describe('#setNewResultRef', () => {
    // Note: the side effects this method can have when called with a defined element and a resultIndex of 0 are tested
    // in the #focusOnFirstResultAfterNextSearch test suite.

    it('should not call #getFirstFocusableDescendant / #props.nextNewItemTarget.setTarget when resultIndex is not the index of the result to focus', () => {
      const getFirstFocusableDescendantMock = vi.mocked(
        getFirstFocusableDescendant
      );
      const getCurrentNumberOfItems = vi.fn(() => 1);
      const itemListCommon = itemListCommonFixture({getCurrentNumberOfItems});

      itemListCommon.focusOnNextNewResult();

      // Ensure element has children to test the right condition.
      const element = document.createElement('span');
      element.appendChild(document.createElement('div'));

      itemListCommon.setNewResultRef(element, 0);

      expect(getFirstFocusableDescendantMock).not.toHaveBeenCalled();
    });

    it('should not call #getFirstFocusableDescendant / #props.nextNewItemTarget.setTarget when element has no children', () => {
      const getFirstFocusableDescendantMock = vi.mocked(
        getFirstFocusableDescendant
      );
      const getCurrentNumberOfItems = vi.fn(() => 0);
      const itemListCommon = itemListCommonFixture({getCurrentNumberOfItems});

      // This will set itemListCommon.indexOfResultToFocus to the return value of getCurrentNumberOfItems (0).
      itemListCommon.focusOnNextNewResult();

      // Ensure resultIndex is equal to itemListCommon.indexOfResultToFocus to test the right condition.
      itemListCommon.setNewResultRef(document.createElement('span'), 0);

      expect(getFirstFocusableDescendantMock).not.toHaveBeenCalled();
    });

    describe('when #element has children and #resultIndex is the index of the result to focus', () => {
      let itemListCommon: ItemListCommon;

      const getCurrentNumberOfItems = vi.fn(() => 0);
      const setTarget = vi.fn();
      const nextNewItemTarget = {
        ...baseNextNewItemTarget,
        setTarget,
      } as unknown as FocusTargetController;

      beforeEach(() => {
        itemListCommon = itemListCommonFixture({
          getCurrentNumberOfItems,
          nextNewItemTarget,
        });

        // This will set itemListCommon.indexOfResultToFocus to 0
        itemListCommon.focusOnNextNewResult();
      });

      it('should make next #setNewResultRef call return without calling #getFirstFocusableDescendant or #props.nextNewItemTarget.setTarget', () => {
        const element = document.createElement('span');
        element.appendChild(document.createElement('div'));

        itemListCommon.setNewResultRef(element, 0);
        itemListCommon.setNewResultRef(element, 0);

        expect(getFirstFocusableDescendant).toHaveBeenCalledOnce();
        expect(setTarget).toHaveBeenCalledOnce();
      });

      it('should call #props.nextNewItemTarget.setTarget with #element when #element has no focusable descendants', () => {
        const elementToFocus = document.createElement('span');
        elementToFocus.appendChild(document.createElement('div'));

        itemListCommon.setNewResultRef(elementToFocus, 0);

        expect(setTarget).toHaveBeenCalledOnce();
        expect(setTarget).toHaveBeenCalledWith(elementToFocus);
      });

      it("should call #props.nextNewItemTarget.setTarget with #element's first focusable descendant when possible", () => {
        const elementToFocus = document.createElement('span');
        const child = document.createElement('div');
        const focusableDescendant = document.createElement('button');
        child.appendChild(focusableDescendant);
        const focusableChild = document.createElement('input');
        elementToFocus.appendChild(child);
        elementToFocus.appendChild(focusableChild);

        itemListCommon.setNewResultRef(elementToFocus, 0);

        expect(setTarget).toHaveBeenCalledOnce();
        expect(setTarget).toHaveBeenCalledWith(focusableDescendant);
      });
    });
  });

  describe('#focusOnNextNewResult', () => {
    it('should call #props.getCurrentNumberOfItems()', () => {
      const getCurrentNumberOfItems = vi.fn();
      const itemListCommon = itemListCommonFixture({
        getCurrentNumberOfItems,
      });

      itemListCommon.focusOnNextNewResult();

      expect(getCurrentNumberOfItems).toHaveBeenCalled();
    });

    it('should make #setNewResultRef(e, n) not call #getFirstFocusableDescendant / #props.nextNewItemTarget.setTarget when e has children and n is not the value returned by #props.getCurrentNumberOfItems()', () => {
      const getFirstFocusableDescendantMock = vi.mocked(
        getFirstFocusableDescendant
      );
      const getCurrentNumberOfItems = vi.fn(() => 5);
      const nextNewItemTarget = {
        focus: vi.fn(),
        focusAfterSearch: vi.fn(),
        focusOnNextTarget: vi.fn(),
        setTarget: vi.fn(),
        registerFocusCallback: vi.fn(),
      } as unknown as FocusTargetController;
      const itemListCommon = itemListCommonFixture({
        getCurrentNumberOfItems,
        nextNewItemTarget,
      });

      itemListCommon.focusOnNextNewResult();

      const element = document.createElement('div');
      element.appendChild(document.createElement('span'));

      itemListCommon.setNewResultRef(element, 0);

      expect(getFirstFocusableDescendantMock).not.toHaveBeenCalled();
      expect(nextNewItemTarget.setTarget).not.toHaveBeenCalled();
    });

    it('should make #setNewResultRef(e, n) call #getFirstFocusableDescendant / #props.nextNewItemTarget.setTarget when e has children and n is equal to the value returned by #props.getCurrentNumberOfItems()', () => {
      const getFirstFocusableDescendantMock = vi.mocked(
        getFirstFocusableDescendant
      );
      const getCurrentNumberOfItems = vi.fn(() => 5);
      const nextNewItemTarget = {
        focus: vi.fn(),
        focusAfterSearch: vi.fn(),
        focusOnNextTarget: vi.fn(),
        setTarget: vi.fn(),
        registerFocusCallback: vi.fn(),
      } as unknown as FocusTargetController;
      const itemListCommon = itemListCommonFixture({
        getCurrentNumberOfItems,
        nextNewItemTarget,
      });

      itemListCommon.focusOnNextNewResult();

      const element = document.createElement('div');
      element.appendChild(document.createElement('span'));

      itemListCommon.setNewResultRef(element, 5);

      expect(getFirstFocusableDescendantMock).toHaveBeenCalled();
      expect(nextNewItemTarget.setTarget).toHaveBeenCalled();
    });

    it('should call #props.nextNewItemTarget.focusOnNextTarget()', () => {
      const nextNewItemTarget = {
        focus: vi.fn(),
        focusAfterSearch: vi.fn(),
        focusOnNextTarget: vi.fn(),
        setTarget: vi.fn(),
        registerFocusCallback: vi.fn(),
      } as unknown as FocusTargetController;
      const itemListCommon = itemListCommonFixture({
        nextNewItemTarget,
      });

      itemListCommon.focusOnNextNewResult();

      expect(nextNewItemTarget.focusOnNextTarget).toHaveBeenCalled();
    });
  });

  describe('#focusOnFirstResultAfterNextSearch', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call the #defer util function', async () => {
      const mockedDefer = vi.mocked(defer);
      const itemListCommon = itemListCommonFixture();

      mockedDefer.mockClear();

      itemListCommon.focusOnFirstResultAfterNextSearch();

      expect(defer).toHaveBeenCalledOnce();
    });

    it('should return a promise', () => {
      const itemListCommon = itemListCommonFixture();

      const result = itemListCommon.focusOnFirstResultAfterNextSearch();

      expect(result).toBeInstanceOf(Promise);
    });

    describe('when its promise resolves', () => {
      it('should clear the current reference to the first result element when #props.getIsLoading() returns true', async () => {
        const mockedDefer = vi.mocked(defer);
        const unsubscribe = vi.fn();
        const engineSubscribe = vi.fn().mockReturnValue(unsubscribe);
        const itemListCommon = itemListCommonFixture({
          engineSubscribe,
          getIsLoading: vi
            .fn()
            .mockReturnValue(false)
            .mockReturnValueOnce(true),
        });

        // This will set itemListCommon.firstResultEl to the element
        itemListCommon.setNewResultRef(document.createElement('div'), 0);

        // getIsLoading returns true on the first call, so itemListCommon.firstResultEl should be cleared.
        itemListCommon.focusOnFirstResultAfterNextSearch();
        await vi.runAllTimersAsync();

        mockedDefer.mockClear();
        unsubscribe.mockClear();

        // getIsLoading now returns false but itemListCommon.firstResultEl was cleared, so we should not unsubscribe.
        await engineSubscribe.mock.lastCall?.[0]();

        expect(unsubscribe).not.toHaveBeenCalled();

        // This will set itemListCommon.firstResultEl again.
        itemListCommon.setNewResultRef(document.createElement('div'), 0);

        // getIsLoading now returns false, so itemListCommon.firstResultEl should not be cleared.
        itemListCommon.focusOnFirstResultAfterNextSearch();
        await vi.runAllTimersAsync();

        unsubscribe.mockClear();

        // getIsLoading returns false and itemListCommon.firstResultEl is defined, so we should unsubscribe
        await engineSubscribe.mock.lastCall?.[0]();

        expect(unsubscribe).toHaveBeenCalledOnce();
      });

      it('should call #props.engineSubscribe with a function', async () => {
        const engineSubscribe = vi.fn();
        const itemListCommon = itemListCommonFixture({engineSubscribe});

        engineSubscribe.mockClear();

        itemListCommon.focusOnFirstResultAfterNextSearch();
        await vi.runAllTimersAsync();

        expect(engineSubscribe).toHaveBeenCalledOnce();
        expect(engineSubscribe).toHaveBeenCalledWith(expect.any(Function));
      });

      describe('when the #props.engineSubscribe function called and its promise is awaited', () => {
        it('should call the #defer util function', async () => {
          const mockedDefer = vi.mocked(defer);
          const engineSubscribe = vi.fn();
          const itemListCommon = itemListCommonFixture({engineSubscribe});

          itemListCommon.focusOnFirstResultAfterNextSearch();
          await vi.runAllTimersAsync();

          mockedDefer.mockClear();

          await engineSubscribe.mock.lastCall?.[0]();

          expect(mockedDefer).toHaveBeenCalledOnce();
        });
        it('should not unsubscribe when #props.getIsLoading() returns true even if #setNewResultRef was previously called with a defined element and a result index of 0', async () => {
          const unsubscribe = vi.fn();
          const engineSubscribe = vi.fn().mockReturnValue(unsubscribe);
          const itemListCommon = itemListCommonFixture({
            engineSubscribe,
            getIsLoading: vi.fn(() => true),
          });

          itemListCommon.setNewResultRef(document.createElement('div'), 0);
          itemListCommon.focusOnFirstResultAfterNextSearch();
          await vi.runAllTimersAsync();

          unsubscribe.mockClear();

          await engineSubscribe.mock.lastCall?.[0]();

          expect(unsubscribe).not.toHaveBeenCalled();
        });

        it('should not unsubscribe when #setNewResultRef was not previously called even if #props.getIsLoading() returns false', async () => {
          const unsubscribe = vi.fn();
          const engineSubscribe = vi.fn().mockReturnValue(unsubscribe);
          const itemListCommon = itemListCommonFixture({
            engineSubscribe,
            getIsLoading: vi.fn(() => false),
          });

          itemListCommon.focusOnFirstResultAfterNextSearch();
          await vi.runAllTimersAsync();

          unsubscribe.mockClear();

          await engineSubscribe.mock.lastCall?.[0]();

          expect(unsubscribe).not.toHaveBeenCalled();
        });
        describe('when #props.getIsLoading() returns false and #setNewResultRef was previously called with a defined element and a result index of 0', () => {
          it('should call the #getFirstFocusableDescendant util function with the element #setNewResultRef was called with', async () => {
            const getFirstFocusableDescendantMock = vi.mocked(
              getFirstFocusableDescendant
            );
            const engineSubscribe = vi.fn().mockReturnValue(vi.fn());
            const itemListCommon = itemListCommonFixture({
              engineSubscribe,
              getIsLoading: vi.fn(() => false),
            });

            const element = document.createElement('div');
            itemListCommon.setNewResultRef(element, 0);
            itemListCommon.focusOnFirstResultAfterNextSearch();
            await vi.runAllTimersAsync();

            getFirstFocusableDescendantMock.mockClear();

            await engineSubscribe.mock.lastCall?.[0]();

            expect(getFirstFocusableDescendantMock).toHaveBeenCalledOnce();
            expect(getFirstFocusableDescendantMock).toHaveBeenCalledWith(
              element
            );
          });

          it('should call ##props.nextNewItemTarget.setTarget with the value returned by the #getFirstFocusableDescendant call when this value is not null', async () => {
            const focusableElement = document.createElement('button');
            vi.mocked(getFirstFocusableDescendant).mockReturnValue(
              focusableElement
            );
            const engineSubscribe = vi.fn().mockReturnValue(vi.fn());
            const setTarget = vi.fn();
            const itemListCommon = itemListCommonFixture({
              engineSubscribe,
              getIsLoading: vi.fn(() => false),
              nextNewItemTarget: {
                ...baseNextNewItemTarget,
                setTarget,
              } as unknown as FocusTargetController,
            });

            itemListCommon.setNewResultRef(document.createElement('div'), 0);
            itemListCommon.focusOnFirstResultAfterNextSearch();
            await vi.runAllTimersAsync();

            setTarget.mockClear();

            await engineSubscribe.mock.lastCall?.[0]();

            expect(setTarget).toHaveBeenCalledOnce();
            expect(setTarget).toHaveBeenCalledWith(focusableElement);
          });

          it('should call #props.nextNewItemTarget.setTarget with the element #setNewResultRef was called with when #getFirstFocusableDescendant returns null', async () => {
            vi.mocked(getFirstFocusableDescendant).mockReturnValue(null);
            const engineSubscribe = vi.fn().mockReturnValue(vi.fn());
            const setTarget = vi.fn();
            const itemListCommon = itemListCommonFixture({
              engineSubscribe,
              getIsLoading: vi.fn(() => false),
              nextNewItemTarget: {
                ...baseNextNewItemTarget,
                setTarget,
              } as unknown as FocusTargetController,
            });

            const element = document.createElement('div');
            itemListCommon.setNewResultRef(element, 0);
            itemListCommon.focusOnFirstResultAfterNextSearch();
            await vi.runAllTimersAsync();

            setTarget.mockClear();

            await engineSubscribe.mock.lastCall?.[0]();

            expect(setTarget).toHaveBeenCalledOnce();
            expect(setTarget).toHaveBeenCalledWith(element);
          });

          it('should call #props.nextNewItemTarget.focus', async () => {
            const engineSubscribe = vi.fn().mockReturnValue(vi.fn());
            const focus = vi.fn();
            const nextNewItemTarget = {
              ...baseNextNewItemTarget,
              focus,
            } as unknown as FocusTargetController;
            const itemListCommon = itemListCommonFixture({
              engineSubscribe,
              getIsLoading: vi.fn(() => false),
              nextNewItemTarget,
            });

            itemListCommon.setNewResultRef(document.createElement('div'), 0);
            itemListCommon.focusOnFirstResultAfterNextSearch();
            await vi.runAllTimersAsync();

            focus.mockClear();

            await engineSubscribe.mock.lastCall?.[0]();

            expect(focus).toHaveBeenCalledOnce();
          });
          it('should unsubscribe', async () => {
            const unsubscribe = vi.fn();
            const engineSubscribe = vi.fn().mockReturnValue(unsubscribe);
            const itemListCommon = itemListCommonFixture({
              engineSubscribe,
              getIsLoading: vi.fn(() => false),
            });

            itemListCommon.setNewResultRef(document.createElement('div'), 0);
            itemListCommon.focusOnFirstResultAfterNextSearch();
            await vi.runAllTimersAsync();

            unsubscribe.mockClear();

            await engineSubscribe.mock.lastCall?.[0]();

            expect(unsubscribe).toHaveBeenCalledOnce();
          });

          it('should not unsubscribe on subsequent calls', async () => {
            const unsubscribe = vi.fn();
            const engineSubscribe = vi.fn().mockReturnValue(unsubscribe);
            const getIsLoading = vi.fn(() => false);
            const itemListCommon = itemListCommonFixture({
              engineSubscribe,
              getIsLoading,
            });

            itemListCommon.setNewResultRef(document.createElement('div'), 0);
            itemListCommon.focusOnFirstResultAfterNextSearch();
            await vi.runAllTimersAsync();

            unsubscribe.mockClear();

            await engineSubscribe.mock.lastCall?.[0]();
            await engineSubscribe.mock.lastCall?.[0]();

            expect(unsubscribe).toHaveBeenCalledOnce();
          });
        });
      });
    });
  });

  const itemListCommonFixture = (props: Partial<ItemListCommonProps> = {}) => {
    const host = document.createElement('div');
    return new ItemListCommon({
      engineSubscribe: vi.fn(),
      getCurrentNumberOfItems: vi.fn(),
      getIsLoading: vi.fn(),
      nextNewItemTarget: {
        focus: vi.fn(),
        focusAfterSearch: vi.fn(),
        focusOnNextTarget: vi.fn(),
        setTarget: vi.fn(),
        registerFocusCallback: vi.fn(),
      } as unknown as FocusTargetController,
      host,
      loadingFlag: '',
      store: {
        setLoadingFlag: vi.fn(),
        state: {
          resultList: vi.fn(),
        },
      } as unknown as CommerceStore,
      ...props,
    });
  };

  const fakeStore = (props: Partial<CommerceStore> = {}) => {
    return {
      setLoadingFlag: vi.fn(),
      state: {
        resultList: vi.fn(),
      },
      ...props,
    } as unknown as CommerceStore;
  };
});
