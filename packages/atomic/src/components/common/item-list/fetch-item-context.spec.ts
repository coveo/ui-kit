import {beforeEach, describe, expect, it, vi} from 'vitest';
import {closest} from '@/src/utils/dom-utils';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {MissingParentError} from './context/item-context-controller';
import {fetchItemContext} from './fetch-item-context';

vi.mock('@/src/utils/dom-utils', {spy: true});
vi.mock('@/src/utils/event-utils', {spy: true});
vi.mock('./context/item-context-controller', {spy: true});

describe('item-context', () => {
  let mockElement: Element;
  let mockEvent: CustomEvent;

  beforeEach(() => {
    vi.clearAllMocks();

    mockElement = {
      nodeName: 'MOCK-ELEMENT',
      dispatchEvent: vi.fn(),
    } as unknown as Element;

    mockEvent = new CustomEvent('atomic/resolveResult', {
      detail: vi.fn(),
      bubbles: true,
      cancelable: true,
      composed: true,
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(buildCustomEvent).mockReturnValue(mockEvent);
  });

  describe('#itemContext', () => {
    it('should build a custom event with correct parameters', () => {
      vi.mocked(closest).mockReturnValue(document.createElement('div'));

      fetchItemContext(mockElement, 'parent-element');

      expect(buildCustomEvent).toHaveBeenCalledWith(
        'atomic/resolveResult',
        expect.any(Function)
      );
    });

    it('should dispatch the custom event on the element', () => {
      vi.mocked(closest).mockReturnValue(document.createElement('div'));

      fetchItemContext(mockElement, 'parent-element');

      expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent);
    });

    it('when parent element is found, should resolve with item', async () => {
      vi.mocked(closest).mockReturnValue(document.createElement('div'));

      const testItem = {id: 'test-item', title: 'Test Item'};

      vi.mocked(buildCustomEvent).mockImplementation((_eventName, handler) => {
        if (typeof handler === 'function') {
          setTimeout(() => handler(testItem), 0);
        }
        return mockEvent;
      });

      const result = await fetchItemContext<typeof testItem>(
        mockElement,
        'parent-element'
      );

      expect(result).toEqual(testItem);
    });

    it('when parent element is not found, should reject with MissingParentError', async () => {
      vi.mocked(closest).mockReturnValue(null);

      const elementWithUpperCase = {
        nodeName: 'ATOMIC-RESULT',
        dispatchEvent: vi.fn(),
      } as unknown as Element;

      const expectedError = new Error(
        'The "atomic-result" element must be the child of an "parent-element" element.'
      );
      expectedError.name = 'MissingParentError';
      vi.mocked(MissingParentError).mockImplementation(function (
        this: unknown
      ) {
        return expectedError;
      });

      await expect(
        fetchItemContext(elementWithUpperCase, 'parent-element')
      ).rejects.toThrow(expectedError);

      expect(MissingParentError).toHaveBeenCalledWith(
        'atomic-result',
        'parent-element'
      );
    });
  });
});
