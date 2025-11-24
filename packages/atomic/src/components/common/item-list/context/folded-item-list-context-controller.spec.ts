import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {FoldedItemListContextController} from './folded-item-list-context-controller';

@customElement('test-element')
class TestElement extends LitElement implements LitElementWithError {
  @state() error!: Error;
  requestUpdate = vi.fn();
}

describe('#FoldedItemListContextController', () => {
  let mockElement: TestElement;
  let controller: FoldedItemListContextController;

  beforeEach(() => {
    mockElement = new TestElement();
    vi.spyOn(mockElement, 'addController');
    vi.spyOn(mockElement, 'requestUpdate');
    vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(false);

    controller = new FoldedItemListContextController(mockElement);
  });

  it('should register itself as a controller with the host', () => {
    expect(mockElement.addController).toHaveBeenCalledWith(controller);
  });

  describe('initial state', () => {
    it('should return null for foldedItemList initially', () => {
      expect(controller.foldedItemList).toBeNull();
    });

    it('should return null for foldedItemListState initially', () => {
      expect(controller.foldedItemListState).toBeNull();
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

    describe('when only controller is provided', () => {
      it('should set the folded item list controller', () => {
        const mockController = {
          logShowMoreFoldedResults: vi.fn(),
          logShowLessFoldedResults: vi.fn(),
        };

        controller.hostConnected();

        const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
        const event = dispatchCall[0] as CustomEvent;
        event.detail(mockController);

        expect(controller.foldedItemList).toBe(mockController);
        expect(controller.foldedItemListState).toBeNull();
        expect(mockElement.requestUpdate).toHaveBeenCalled();
      });
    });

    describe('when only state is provided', () => {
      it('should set the folded item list state and subscribe to changes', () => {
        const mockState = {results: []};
        const unsubscribe = vi.fn();
        const subscribe = vi.fn().mockReturnValue(unsubscribe);
        const subscribableState = {
          state: mockState,
          subscribe,
        };

        controller.hostConnected();

        const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
        const event = dispatchCall[0] as CustomEvent;
        event.detail(subscribableState);

        expect(controller.foldedItemListState).toBe(mockState);
        expect(controller.foldedItemList).toBeNull();
        expect(subscribe).toHaveBeenCalled();
        expect(mockElement.requestUpdate).toHaveBeenCalled();
      });

      it('should update state when subscription callback is called', () => {
        const initialState = {results: []};
        const updatedState = {results: [{id: '1'}]};
        let subscriptionCallback: (() => void) | null = null;

        const subscribableState = {
          state: initialState,
          subscribe: vi.fn((callback: () => void) => {
            subscriptionCallback = callback;
            return vi.fn();
          }),
        };

        controller.hostConnected();

        const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
        const event = dispatchCall[0] as CustomEvent;
        event.detail(subscribableState);

        expect(controller.foldedItemListState).toBe(initialState);

        // Simulate state update
        subscribableState.state = updatedState;
        vi.clearAllMocks();

        // Call subscription callback
        if (subscriptionCallback) {
          subscriptionCallback();
        }

        expect(controller.foldedItemListState).toBe(updatedState);
        expect(mockElement.requestUpdate).toHaveBeenCalled();
      });

      it('should handle subscribe that returns void', () => {
        const mockState = {results: []};
        const subscribableState = {
          state: mockState,
          subscribe: vi.fn(), // Returns undefined
        };

        controller.hostConnected();

        const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
        const event = dispatchCall[0] as CustomEvent;
        event.detail(subscribableState);

        expect(controller.foldedItemListState).toBe(mockState);
        expect(subscribableState.subscribe).toHaveBeenCalled();
      });
    });

    describe('when both controller and state are provided', () => {
      it('should set both controller and state', () => {
        const mockController = {
          logShowMoreFoldedResults: vi.fn(),
          logShowLessFoldedResults: vi.fn(),
        };
        const mockState = {results: []};
        const unsubscribe = vi.fn();
        const subscribe = vi.fn().mockReturnValue(unsubscribe);

        const combined = {
          controller: mockController,
          state: {
            state: mockState,
            subscribe,
          },
        };

        controller.hostConnected();

        const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
        const event = dispatchCall[0] as CustomEvent;
        event.detail(combined);

        expect(controller.foldedItemList).toBe(mockController);
        expect(controller.foldedItemListState).toBe(mockState);
        expect(subscribe).toHaveBeenCalled();
        expect(mockElement.requestUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('#hostDisconnected', () => {
    it('should unsubscribe when disconnected', () => {
      const unsubscribe = vi.fn();
      const subscribe = vi.fn().mockReturnValue(unsubscribe);
      const subscribableState = {
        state: {results: []},
        subscribe,
      };

      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(subscribableState);

      expect(subscribe).toHaveBeenCalled();

      controller.hostDisconnected();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('should handle disconnect when there is no subscription', () => {
      const mockController = {
        logShowMoreFoldedResults: vi.fn(),
      };

      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(mockController);

      expect(() => controller.hostDisconnected()).not.toThrow();
    });

    it('should set unsubscribe to null after calling it', () => {
      const unsubscribe = vi.fn();
      const subscribe = vi.fn().mockReturnValue(unsubscribe);
      const subscribableState = {
        state: {results: []},
        subscribe,
      };

      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(subscribableState);

      controller.hostDisconnected();

      expect(unsubscribe).toHaveBeenCalled();

      // Calling disconnect again should not throw
      expect(() => controller.hostDisconnected()).not.toThrow();
    });
  });
});
