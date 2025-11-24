import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  FoldedItemListContextController,
  MissingParentError,
} from './folded-item-list-context-controller';

@customElement('test-element')
class TestElement extends LitElement {
  @state() error: Error | null = null;
  requestUpdate = vi.fn();
}

describe('#FoldedItemListContextController', () => {
  let mockElement: TestElement;
  let controller: FoldedItemListContextController;

  beforeEach(() => {
    mockElement = new TestElement();
    vi.spyOn(mockElement, 'addController');
    vi.spyOn(mockElement, 'requestUpdate');
    vi.spyOn(mockElement, 'dispatchEvent');

    controller = new FoldedItemListContextController(mockElement);
  });

  it('should register itself as a controller with the host', () => {
    expect(mockElement.addController).toHaveBeenCalledWith(controller);
  });

  describe('initial state', () => {
    it('should return null for foldedItemList initially', () => {
      expect(controller.foldedItemList).toBeNull();
    });

    it('should return null for error initially', () => {
      expect(controller.error).toBeNull();
    });

    it('should return false for hasError initially', () => {
      expect(controller.hasError).toBe(false);
    });
  });

  describe('#hostConnected', () => {
    it('should dispatch the resolveFoldedResultList event', () => {
      controller.hostConnected();

      expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/resolveFoldedResultList',
        })
      );
    });

    describe('when parent responds with folded item list', () => {
      it('should set the folded item list', () => {
        const mockFoldedItemList = {
          logShowMoreFoldedResults: vi.fn(),
          logShowLessFoldedResults: vi.fn(),
        };

        vi.mocked(mockElement.dispatchEvent).mockImplementation((event) => {
          const customEvent = event as CustomEvent;
          customEvent.detail(mockFoldedItemList);
          return false; // Event was not canceled
        });

        controller.hostConnected();

        expect(controller.foldedItemList).toBe(mockFoldedItemList);
        expect(controller.error).toBeNull();
        expect(controller.hasError).toBe(false);
        expect(mockElement.error).toBeNull();
        expect(mockElement.requestUpdate).toHaveBeenCalled();
      });
    });

    describe('when no parent responds', () => {
      it('should set error state', () => {
        vi.mocked(mockElement.dispatchEvent).mockReturnValue(true); // Event was canceled

        controller.hostConnected();

        expect(controller.foldedItemList).toBeNull();
        expect(controller.error).toBeInstanceOf(MissingParentError);
        expect(controller.hasError).toBe(true);
        expect(mockElement.error).toBeInstanceOf(MissingParentError);
        expect(mockElement.requestUpdate).toHaveBeenCalled();
      });

      it('should include element name in error message', () => {
        vi.mocked(mockElement.dispatchEvent).mockReturnValue(true);

        controller.hostConnected();

        expect(controller.error?.message).toContain('test-element');
        expect(controller.error?.message).toContain(
          'atomic-folded-result-list'
        );
        expect(controller.error?.message).toContain(
          'atomic-insight-folded-result-list'
        );
      });
    });

    describe('when error is cleared after successful connection', () => {
      it('should clear previous error state', () => {
        const mockFoldedItemList = {
          logShowMoreFoldedResults: vi.fn(),
        };

        // First connection fails
        vi.mocked(mockElement.dispatchEvent).mockReturnValue(true);
        controller.hostConnected();
        expect(controller.hasError).toBe(true);

        // Second connection succeeds
        vi.mocked(mockElement.dispatchEvent).mockImplementation((event) => {
          const customEvent = event as CustomEvent;
          customEvent.detail(mockFoldedItemList);
          return false;
        });

        vi.mocked(mockElement.requestUpdate).mockClear();
        controller.hostConnected();

        expect(controller.foldedItemList).toBe(mockFoldedItemList);
        expect(controller.error).toBeNull();
        expect(controller.hasError).toBe(false);
        expect(mockElement.error).toBeNull();
      });
    });
  });
});
