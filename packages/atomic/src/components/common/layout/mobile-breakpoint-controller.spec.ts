import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {BaseStore} from '@/src/components/common/interface/store';
import {MobileBreakpointController} from './mobile-breakpoint-controller';

@customElement('test-mobile-element')
class TestMobileElement extends LitElement {
  addController = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

describe('MobileBreakpointController', () => {
  let mockElement: TestMobileElement;
  let mockStore: BaseStore<{mobileBreakpoint: string}>;
  let controller: MobileBreakpointController;

  beforeEach(() => {
    mockElement = new TestMobileElement();
    mockStore = {
      state: {
        mobileBreakpoint: '900px',
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
    beforeEach(() => {
      controller = new MobileBreakpointController(mockElement, mockStore);
    });

    it('should initialize with provided parameters', () => {
      expect(mockElement.addController).toHaveBeenCalledWith(controller);
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
  });

  describe('when receiving atomic-layout-breakpoint-change event', () => {
    let eventListener: (e: Event) => void;

    beforeEach(() => {
      controller = new MobileBreakpointController(mockElement, mockStore);
      controller.hostConnected();
      eventListener = mockElement.addEventListener.mock.calls[0][1];
    });
    it('should update store with new breakpoint value', () => {
      const event = new CustomEvent('atomic-layout-breakpoint-change', {
        detail: {breakpoint: '1024px'},
      });

      eventListener(event);

      expect(mockStore.state.mobileBreakpoint).toBe('1024px');
    });

    it('should update store with different breakpoint values', () => {
      const smallEvent = new CustomEvent('atomic-layout-breakpoint-change', {
        detail: {breakpoint: '500px'},
      });

      eventListener(smallEvent);
      expect(mockStore.state.mobileBreakpoint).toBe('500px');

      const mediumEvent = new CustomEvent('atomic-layout-breakpoint-change', {
        detail: {breakpoint: '768px'},
      });

      eventListener(mediumEvent);
      expect(mockStore.state.mobileBreakpoint).toBe('768px');
    });

    it.each([
      {
        description: 'event without detail',
        eventOptions: undefined,
      },
      {
        description: 'event with null detail',
        eventOptions: {detail: null},
      },
      {
        description: 'event with detail but no breakpoint',
        eventOptions: {detail: {otherProperty: 'value'}},
      },
      {
        description: 'event with empty string breakpoint',
        eventOptions: {detail: {breakpoint: ''}},
      },
      {
        description: 'event with null breakpoint',
        eventOptions: {detail: {breakpoint: null}},
      },
      {
        description: 'event with undefined breakpoint',
        eventOptions: {detail: {breakpoint: undefined}},
      },
      {
        description: 'event with false breakpoint',
        eventOptions: {detail: {breakpoint: false}},
      },
      {
        description: 'event with 0 breakpoint',
        eventOptions: {detail: {breakpoint: 0}},
      },
    ])('should handle $description', ({eventOptions}) => {
      mockStore.state.mobileBreakpoint = '900px';
      const event = new CustomEvent(
        'atomic-layout-breakpoint-change',
        eventOptions as CustomEventInit
      );

      expect(() => eventListener(event)).not.toThrow();
      expect(mockStore.state.mobileBreakpoint).toBe('900px');
    });
  });
});
