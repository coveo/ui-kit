import {CommerceStore} from '@/src/components';
import {getFirstFocusableDescendant} from '@/src/utils/accessibility-utils';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ItemListCommonProps} from './item-list-common';
import {ItemListCommon} from './item-list-common';

vi.mock('@/src/utils/accessibility-utils', {spy: true});
vi.mock('@/src/utils/replace-breakpoint', {spy: true});

describe('ItemListCommon', () => {
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
  });

  describe('#updateBreakpoints', () => {
    it('should call the #updateBreakpoints util function with #props.host only once', () => {
      const mockedUpdateBreakpoints = vi.mocked(updateBreakpoints);
      const host = document.createElement('span');

      const itemListCommon = itemListCommonFixture({host});

      expect(mockedUpdateBreakpoints).not.toHaveBeenCalled();

      itemListCommon.updateBreakpoints();
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
    // TODO: We should test side effects on #focusOnFirstResultAfterNexSearch instead, but this will do for now.
    it('should set #firstResultEl to the element when resultIndex is 0', () => {
      const itemListCommon = itemListCommonFixture();
      const element = document.createElement('span');

      itemListCommon.setNewResultRef(element, 0);

      // @ts-expect-error - testing private property
      expect(itemListCommon.firstResultEl).toBe(element);
    });

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

      // This will set itemListCommon.indexOfResultToFocus to the return value of getCurrentNumbnerOfItems (0).
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
        focus: vi.fn(),
        focusAfterSearch: vi.fn(),
        focusOnNextTarget: vi.fn(),
        setTarget,
      };

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
      };
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
      };
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
      };
      const itemListCommon = itemListCommonFixture({
        nextNewItemTarget,
      });

      itemListCommon.focusOnNextNewResult();

      expect(nextNewItemTarget.focusOnNextTarget).toHaveBeenCalled();
    });
  });

  describe('#focusOnFirstResultAfterNextSearch', () => {
    it('TODO', () => {
      // TODO: This method would be very complex to test. We should probably rework it.
    });
  });

  const itemListCommonFixture = (props: Partial<ItemListCommonProps> = {}) => {
    return new ItemListCommon({
      engineSubscribe: vi.fn(),
      getCurrentNumberOfItems: vi.fn(),
      getIsLoading: vi.fn(),
      nextNewItemTarget: {
        focus: vi.fn(),
        focusAfterSearch: vi.fn(),
        focusOnNextTarget: vi.fn(),
        setTarget: vi.fn(),
      },
      host: document.createElement('div'),
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
