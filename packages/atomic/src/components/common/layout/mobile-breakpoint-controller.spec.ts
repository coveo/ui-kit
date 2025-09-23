import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {BaseStore} from '../interface/store';
import {MobileBreakpointController} from './mobile-breakpoint-controller';

@customElement('test-mobile-element')
class TestMobileElement extends LitElement {
  addController = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

describe('mobile-breakpoint-controller', () => {
  let mockElement: TestMobileElement;
  let mockStore: BaseStore<{mobileBreakpoint: string}>;
  let controller: MobileBreakpointController;

  beforeEach(() => {
    vi.clearAllMocks();

    mockElement = new TestMobileElement();
    mockStore = {
      state: {
        mobileBreakpoint: 'initial',
      },
      get: vi.fn(),
      set: vi.fn(),
      onChange: vi.fn(),
      getUniqueIDFromEngine: vi.fn(),
    };

    vi.spyOn(mockElement, 'addEventListener');
    vi.spyOn(mockElement, 'removeEventListener');
  });
  describe('#constructor', () => {
    it('should initialize with provided parameters', () => {
      controller = new MobileBreakpointController(mockElement, mockStore);

      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    it('should store the provided store reference', () => {
      controller = new MobileBreakpointController(mockElement, mockStore);

      // Access private property for testing
      expect(
        (
          controller as unknown as {
            store: BaseStore<{mobileBreakpoint: string}>;
          }
        ).store
      ).toBe(mockStore);
    });

    it('should store the provided host reference', () => {
      controller = new MobileBreakpointController(mockElement, mockStore);

      expect((controller as unknown as {host: TestMobileElement}).host).toBe(
        mockElement
      );
    });
  });

  describe('#hostConnected', () => {
    beforeEach(() => {
      controller = new MobileBreakpointController(mockElement, mockStore);
    });

    it('should add event listener for atomic-layout-breakpoint-change', () => {
      controller.hostConnected();

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'atomic-layout-breakpoint-change',
        expect.any(Function)
      );
    });

    it('should add the same event listener function on multiple calls', () => {
      controller.hostConnected();
      controller.hostConnected();

      expect(mockElement.addEventListener).toHaveBeenCalledTimes(2);
      const firstCall = mockElement.addEventListener.mock.calls[0][1];
      const secondCall = mockElement.addEventListener.mock.calls[1][1];
      expect(firstCall).toBe(secondCall);
    });
  });

  describe('#hostDisconnected', () => {
    beforeEach(() => {
      controller = new MobileBreakpointController(mockElement, mockStore);
    });

    it('should remove event listener for atomic-layout-breakpoint-change', () => {
      controller.hostConnected();
      controller.hostDisconnected();

      expect(mockElement.removeEventListener).toHaveBeenCalledWith(
        'atomic-layout-breakpoint-change',
        expect.any(Function)
      );
    });

    it('should remove the same event listener function that was added', () => {
      controller.hostConnected();
      controller.hostDisconnected();

      const addedListener = mockElement.addEventListener.mock.calls[0][1];
      const removedListener = mockElement.removeEventListener.mock.calls[0][1];
      expect(addedListener).toBe(removedListener);
    });

    it('should handle disconnect without connect', () => {
      expect(() => controller.hostDisconnected()).not.toThrow();
      expect(mockElement.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    let eventListener: (e: Event) => void;

    beforeEach(() => {
      controller = new MobileBreakpointController(mockElement, mockStore);
      controller.hostConnected();
      eventListener = mockElement.addEventListener.mock.calls[0][1];
    });

    describe('when receiving atomic-layout-breakpoint-change event', () => {
      it('should update store with new breakpoint value', () => {
        const event = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {breakpoint: 'large'},
        });

        eventListener(event);

        expect(mockStore.state.mobileBreakpoint).toBe('large');
      });

      it('should update store with different breakpoint values', () => {
        const smallEvent = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {breakpoint: 'small'},
        });

        eventListener(smallEvent);
        expect(mockStore.state.mobileBreakpoint).toBe('small');

        const mediumEvent = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {breakpoint: 'medium'},
        });

        eventListener(mediumEvent);
        expect(mockStore.state.mobileBreakpoint).toBe('medium');
      });

      it('should not update store when breakpoint is the same', () => {
        mockStore.state.mobileBreakpoint = 'large';
        const event = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {breakpoint: 'large'},
        });

        eventListener(event);

        // Should still be 'large', but this test mainly ensures no error occurs
        expect(mockStore.state.mobileBreakpoint).toBe('large');
      });

      it('should handle event without detail', () => {
        const event = new CustomEvent('atomic-layout-breakpoint-change');

        expect(() => eventListener(event)).not.toThrow();
        expect(mockStore.state.mobileBreakpoint).toBe('initial');
      });

      it('should handle event with null detail', () => {
        const event = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: null,
        });

        expect(() => eventListener(event)).not.toThrow();
        expect(mockStore.state.mobileBreakpoint).toBe('initial');
      });

      it('should handle event with detail but no breakpoint', () => {
        const event = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {otherProperty: 'value'},
        });

        expect(() => eventListener(event)).not.toThrow();
        expect(mockStore.state.mobileBreakpoint).toBe('initial');
      });

      it('should handle event with empty string breakpoint', () => {
        const event = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {breakpoint: ''},
        });

        expect(() => eventListener(event)).not.toThrow();
        expect(mockStore.state.mobileBreakpoint).toBe('initial');
      });

      it('should handle event with falsy breakpoint values', () => {
        const falsyValues = [null, undefined, false, 0];

        falsyValues.forEach((falsyValue) => {
          mockStore.state.mobileBreakpoint = 'initial';
          const event = new CustomEvent('atomic-layout-breakpoint-change', {
            detail: {breakpoint: falsyValue},
          });

          expect(() => eventListener(event)).not.toThrow();
          expect(mockStore.state.mobileBreakpoint).toBe('initial');
        });
      });
    });

    describe('when receiving non-CustomEvent', () => {
      it('should handle regular Event without throwing', () => {
        const event = new Event('atomic-layout-breakpoint-change');

        expect(() => eventListener(event)).not.toThrow();
        expect(mockStore.state.mobileBreakpoint).toBe('initial');
      });
    });
  });

  describe('integration tests', () => {
    it('should work correctly with full lifecycle', () => {
      controller = new MobileBreakpointController(mockElement, mockStore);

      // Connect and verify listener is added
      controller.hostConnected();
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'atomic-layout-breakpoint-change',
        expect.any(Function)
      );

      // Simulate breakpoint change
      const eventListener = mockElement.addEventListener.mock.calls[0][1];
      const event = new CustomEvent('atomic-layout-breakpoint-change', {
        detail: {breakpoint: 'tablet'},
      });

      eventListener(event);
      expect(mockStore.state.mobileBreakpoint).toBe('tablet');

      // Disconnect and verify cleanup
      controller.hostDisconnected();
      expect(mockElement.removeEventListener).toHaveBeenCalledWith(
        'atomic-layout-breakpoint-change',
        eventListener
      );
    });

    it('should handle multiple connect/disconnect cycles', () => {
      controller = new MobileBreakpointController(mockElement, mockStore);

      // First cycle
      controller.hostConnected();
      controller.hostDisconnected();

      // Second cycle
      controller.hostConnected();
      controller.hostDisconnected();

      expect(mockElement.addEventListener).toHaveBeenCalledTimes(2);
      expect(mockElement.removeEventListener).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple breakpoint changes', () => {
      controller = new MobileBreakpointController(mockElement, mockStore);
      controller.hostConnected();

      const eventListener = mockElement.addEventListener.mock.calls[0][1];
      const breakpoints = ['small', 'medium', 'large', 'xlarge'];

      breakpoints.forEach((breakpoint) => {
        const event = new CustomEvent('atomic-layout-breakpoint-change', {
          detail: {breakpoint},
        });
        eventListener(event);
        expect(mockStore.state.mobileBreakpoint).toBe(breakpoint);
      });
    });
  });

  describe('store interaction', () => {
    beforeEach(() => {
      controller = new MobileBreakpointController(mockElement, mockStore);
      controller.hostConnected();
    });

    it('should only update store when breakpoint value changes', () => {
      const eventListener = mockElement.addEventListener.mock.calls[0][1];

      // Set initial value
      mockStore.state.mobileBreakpoint = 'medium';

      // Same value should not trigger update
      const sameValueEvent = new CustomEvent(
        'atomic-layout-breakpoint-change',
        {
          detail: {breakpoint: 'medium'},
        }
      );

      eventListener(sameValueEvent);
      expect(mockStore.state.mobileBreakpoint).toBe('medium');

      // Different value should trigger update
      const differentValueEvent = new CustomEvent(
        'atomic-layout-breakpoint-change',
        {
          detail: {breakpoint: 'large'},
        }
      );

      eventListener(differentValueEvent);
      expect(mockStore.state.mobileBreakpoint).toBe('large');
    });

    it('should work with different store implementations', () => {
      const alternativeStore: BaseStore<{mobileBreakpoint: string}> = {
        state: {
          mobileBreakpoint: 'alternative-initial',
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
        getUniqueIDFromEngine: vi.fn(),
      };

      const alternativeController = new MobileBreakpointController(
        mockElement,
        alternativeStore
      );

      alternativeController.hostConnected();
      const eventListener = mockElement.addEventListener.mock.calls[1][1];

      const event = new CustomEvent('atomic-layout-breakpoint-change', {
        detail: {breakpoint: 'alternative-large'},
      });

      eventListener(event);
      expect(alternativeStore.state.mobileBreakpoint).toBe('alternative-large');
    });
  });
});
