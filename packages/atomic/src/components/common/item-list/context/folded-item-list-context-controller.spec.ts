import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  FoldedItemListContextController,
  MissingParentError,
} from './folded-item-list-context-controller';

@customElement('test-element')
class TestElement extends LitElement {
  @state() error!: Error;

  requestUpdate = vi.fn();
}

describe('folded-item-list-context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('#MissingParentError', () => {
    it('should create error with correct message when provided element name', () => {
      const error = new MissingParentError('child-element');

      expect(error.message).toBe(
        'The "child-element" element must be the child of an "atomic-folded-result-list" or "atomic-insight-folded-result-list" element.'
      );
    });
  });

  describe('#FoldedItemListContextController', () => {
    let mockElement: TestElement;
    let controller: FoldedItemListContextController;

    beforeEach(() => {
      mockElement = new TestElement();
      vi.spyOn(mockElement, 'addController');
      vi.spyOn(mockElement, 'dispatchEvent');
    });

    it('should register itself as a controller with the host', () => {
      controller = new FoldedItemListContextController(mockElement);

      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    describe('when controller is connected', () => {
      beforeEach(() => {
        controller = new FoldedItemListContextController(mockElement);
      });

      it('should dispatch the resolveFoldedResultList event in #hostConnected', () => {
        vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(false);

        controller.hostConnected();

        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'atomic/resolveFoldedResultList',
          })
        );
      });

      describe('when event is not canceled', () => {
        beforeEach(() => {
          vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
            const customEvent = event as CustomEvent;
            const handler = customEvent.detail;
            if (typeof handler === 'function') {
              handler({
                logShowMoreFoldedResults: vi.fn(),
                logShowLessFoldedResults: vi.fn(),
              });
            }
            return false;
          });
        });

        it('should set folded item list data', () => {
          controller.hostConnected();

          expect(controller.foldedItemList).toEqual({
            logShowMoreFoldedResults: expect.any(Function),
            logShowLessFoldedResults: expect.any(Function),
          });
        });

        it('should clear error', () => {
          controller.hostConnected();

          expect(controller.error).toBeNull();
          expect(controller.hasError).toBe(false);
          expect(mockElement.error).toBeUndefined();
        });

        it('should request update', () => {
          controller.hostConnected();

          expect(mockElement.requestUpdate).toHaveBeenCalledTimes(1);
        });
      });

      describe('when event is canceled', () => {
        beforeEach(() => {
          vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(true);
          Object.defineProperty(mockElement, 'nodeName', {
            value: 'TEST-ELEMENT',
            configurable: true,
          });
        });

        it('should set error', () => {
          controller.hostConnected();

          expect(controller.error).toBeInstanceOf(MissingParentError);
          expect(controller.hasError).toBe(true);
          expect(controller.error?.message).toBe(
            'The "test-element" element must be the child of an "atomic-folded-result-list" or "atomic-insight-folded-result-list" element.'
          );
          expect(mockElement.error).toBe(controller.error);
        });

        it('should clear folded item list data', () => {
          controller.hostConnected();

          expect(controller.foldedItemList).toBeNull();
        });

        it('should request update', () => {
          controller.hostConnected();

          expect(mockElement.requestUpdate).toHaveBeenCalledTimes(2);
        });
      });

      describe('#foldedItemList getter', () => {
        beforeEach(() => {
          controller = new FoldedItemListContextController(mockElement);
        });

        it('should return null when there is an error', () => {
          vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(true);
          Object.defineProperty(mockElement, 'nodeName', {
            value: 'TEST-ELEMENT',
            configurable: true,
          });

          controller.hostConnected();

          expect(controller.foldedItemList).toBeNull();
        });

        it('should return folded item list data when there is no error', () => {
          const mockFoldedItemList = {
            logShowMoreFoldedResults: vi.fn(),
            logShowLessFoldedResults: vi.fn(),
          };

          vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
            const customEvent = event as CustomEvent;
            const handler = customEvent.detail;
            if (typeof handler === 'function') {
              handler(mockFoldedItemList);
            }
            return false;
          });

          controller.hostConnected();

          expect(controller.foldedItemList).toBe(mockFoldedItemList);
        });
      });
    });
  });
});
