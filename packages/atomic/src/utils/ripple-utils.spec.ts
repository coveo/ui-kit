import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as eventUtils from './event-utils';
import {createRipple} from './ripple-utils';

vi.mock('./event-utils', {spy: true});

describe('ripple-utils', () => {
  let mockButton: HTMLElement;
  let mockEvent: MouseEvent;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();

    mockButton = document.createElement('button');
    Object.defineProperties(mockButton, {
      clientWidth: {value: 100, writable: true, configurable: true},
      clientHeight: {value: 80, writable: true, configurable: true},
      getBoundingClientRect: {
        value: vi.fn().mockReturnValue({
          top: 50,
          left: 100,
          width: 100,
          height: 80,
        }),
        writable: true,
        configurable: true,
      },
    });
    document.body.appendChild(mockButton);

    mockEvent = {
      currentTarget: mockButton,
      clientX: 150,
      clientY: 90,
    } as unknown as MouseEvent;

    Object.defineProperty(globalThis, 'getComputedStyle', {
      value: vi.fn().mockReturnValue({
        position: 'static',
      }),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('#createRipple', () => {
    it('should create a ripple element when called', async () => {
      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple');
      expect(ripple).toBeTruthy();
      expect(ripple?.tagName).toBe('SPAN');
      expect(ripple?.classList.contains('ripple')).toBe(true);

      // Fast-forward timers to complete the animation
      vi.runAllTimers();
      await ripplePromise;
    });

    it('should remove existing ripple before creating new one', async () => {
      const options = {color: 'primary'};

      const firstRipplePromise = createRipple(mockEvent, options);
      const firstRipple = mockButton.querySelector('.ripple');
      expect(firstRipple).toBeTruthy();

      const secondRipplePromise = createRipple(mockEvent, options);
      const ripples = mockButton.querySelectorAll('.ripple');
      expect(ripples.length).toBe(1);

      vi.runAllTimers();
      await Promise.all([firstRipplePromise, secondRipplePromise]);
    });

    it('should add ripple-parent class to button', async () => {
      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      expect(mockButton.classList.contains('ripple-parent')).toBe(true);

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should add ripple-relative class when position is static', async () => {
      const options = {color: 'primary'};
      Object.defineProperty(globalThis, 'getComputedStyle', {
        value: vi.fn().mockReturnValue({
          position: 'static',
        }),
        writable: true,
        configurable: true,
      });

      const ripplePromise = createRipple(mockEvent, options);

      expect(mockButton.classList.contains('ripple-relative')).toBe(true);

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should not add ripple-relative class when position is not static', async () => {
      const options = {color: 'primary'};
      Object.defineProperty(globalThis, 'getComputedStyle', {
        value: vi.fn().mockReturnValue({
          position: 'relative',
        }),
        writable: true,
        configurable: true,
      });

      const ripplePromise = createRipple(mockEvent, options);

      expect(mockButton.classList.contains('ripple-relative')).toBe(false);

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should add ripple-relative class to child elements with static position', async () => {
      const child = document.createElement('span');
      mockButton.appendChild(child);

      Object.defineProperty(globalThis, 'getComputedStyle', {
        value: vi.fn().mockImplementation((element) => ({
          position: element === child ? 'static' : 'relative',
        })),
        writable: true,
        configurable: true,
      });

      const options = {color: 'primary'};
      const ripplePromise = createRipple(mockEvent, options);

      expect(child.classList.contains('ripple-relative')).toBe(true);

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should set correct ripple styles', async () => {
      const options = {color: 'secondary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple') as HTMLElement;
      expect(ripple?.style.backgroundColor).toBe('var(--atomic-secondary)');
      expect(ripple?.getAttribute('part')).toBe('ripple');

      // Diameter should be max of width and height (100px)
      expect(ripple?.style.width).toBe('100px');
      expect(ripple?.style.height).toBe('100px');

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should position ripple correctly based on click coordinates', async () => {
      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple') as HTMLElement;

      // Click at (150, 90), button at (100, 50), radius = 50
      // Left: 150 - (100 + 50) = 0
      // Top: 90 - (50 + 50) = -10
      expect(ripple?.style.left).toBe('0px');
      expect(ripple?.style.top).toBe('-10px');

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should use parent element when provided in options', async () => {
      const parentElement = document.createElement('div');
      Object.defineProperties(parentElement, {
        clientWidth: {value: 200, writable: true, configurable: true},
        clientHeight: {value: 150, writable: true, configurable: true},
        getBoundingClientRect: {
          value: vi.fn().mockReturnValue({
            top: 0,
            left: 0,
            width: 200,
            height: 150,
          }),
          writable: true,
          configurable: true,
        },
      });
      document.body.appendChild(parentElement);

      const options = {color: 'primary', parent: parentElement};

      const ripplePromise = createRipple(mockEvent, options);

      expect(parentElement.classList.contains('ripple-parent')).toBe(true);
      expect(parentElement.querySelector('.ripple')).toBeTruthy();

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should calculate animation duration based on radius', async () => {
      Object.defineProperties(mockButton, {
        clientWidth: {value: 318, writable: true, configurable: true},
        clientHeight: {value: 318, writable: true, configurable: true},
      });

      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple') as HTMLElement;

      // Diameter = 318, radius = 159
      // Duration = Math.cbrt(159) * 129.21 ≈ 700ms
      const expectedDuration = Math.cbrt(159) * 129.21;
      expect(ripple?.style.getPropertyValue('--animation-duration')).toBe(
        `${expectedDuration}ms`
      );

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should set up event listener for animationend', async () => {
      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      expect(eventUtils.listenOnce).toHaveBeenCalled();
      const [element, eventType] = vi.mocked(eventUtils.listenOnce).mock
        .calls[0];
      expect(element).toBe(mockButton.querySelector('.ripple'));
      expect(eventType).toBe('animationend');

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should prepend ripple to button', async () => {
      const existingChild = document.createElement('span');
      existingChild.textContent = 'Button Text';
      mockButton.appendChild(existingChild);

      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      expect(mockButton.firstChild).toBe(mockButton.querySelector('.ripple'));

      vi.runAllTimers();
      await ripplePromise;
    });

    it("should handle cleanup with timeout even if animation doesn't end", async () => {
      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple');
      expect(ripple).toBeTruthy();

      vi.runAllTimers();

      await ripplePromise;
    });

    it('should use diameter as max of width and height', async () => {
      // Set different width and height
      Object.defineProperties(mockButton, {
        clientWidth: {value: 80, writable: true, configurable: true},
        clientHeight: {value: 120, writable: true, configurable: true},
      });

      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple') as HTMLElement;

      // Diameter should be max(80, 120) = 120
      expect(ripple?.style.width).toBe('120px');
      expect(ripple?.style.height).toBe('120px');

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should handle edge case with zero dimensions', async () => {
      Object.defineProperties(mockButton, {
        clientWidth: {value: 0, writable: true, configurable: true},
        clientHeight: {value: 0, writable: true, configurable: true},
      });

      const options = {color: 'primary'};

      const ripplePromise = createRipple(mockEvent, options);

      const ripple = mockButton.querySelector('.ripple') as HTMLElement;
      expect(ripple?.style.width).toBe('0px');
      expect(ripple?.style.height).toBe('0px');

      vi.runAllTimers();
      await ripplePromise;
    });

    it('should handle different color options correctly', async () => {
      const testColors = [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
      ];

      for (const color of testColors) {
        const options = {color};
        const ripplePromise = createRipple(mockEvent, options);

        const ripple = mockButton.querySelector('.ripple') as HTMLElement;
        expect(ripple?.style.backgroundColor).toBe(`var(--atomic-${color})`);

        vi.runAllTimers();
        await ripplePromise;

        ripple?.remove();
      }
    });
  });
});
