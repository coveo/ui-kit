import {describe, expect, it, vi} from 'vitest';
import {eventPromise, listenOnce} from './event-utils';

describe('event-utils', () => {
  describe('#listenOnce', () => {
    it('should only listen to an event once', () => {
      const handler = vi.fn();
      const element = document.createElement('div');

      listenOnce(element, 'click', handler);
      element.click();
      element.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should call the handler with the dispatched event', () => {
      const handler = vi.fn();
      const element = document.createElement('div');
      const dispatchedEvent = new Event('custom');

      listenOnce(element, 'custom', handler);
      element.dispatchEvent(dispatchedEvent);

      expect(handler).toHaveBeenCalledWith(dispatchedEvent);
    });
  });

  describe('#eventPromise', () => {
    it('should resolve with the dispatched event when no timeout is provided', async () => {
      const element = document.createElement('div');
      const promise = eventPromise(element, 'custom-event');

      const dispatchedEvent = new Event('custom-event');
      element.dispatchEvent(dispatchedEvent);

      await expect(promise).resolves.toBe(dispatchedEvent);
    });

    it('should reject when the event is not dispatched before the timeout', async () => {
      vi.useFakeTimers();
      try {
        const element = document.createElement('div');
        const promise = eventPromise(element, 'custom-event', 10);

        vi.advanceTimersByTime(10);

        await expect(promise).rejects.toThrow('Promise timed out.');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should reject when the timeout occurs before the event fires', async () => {
      vi.useFakeTimers();
      try {
        const element = document.createElement('div');
        const eventListener = vi.fn();
        element.addEventListener('custom-event', eventListener);
        const promise = eventPromise(element, 'custom-event', 10);

        setTimeout(() => {
          element.dispatchEvent(new Event('custom-event'));
        }, 20);

        vi.advanceTimersByTime(20);

        expect(eventListener).toHaveBeenCalledTimes(1); // The event fired

        await expect(promise).rejects.toThrow('Promise timed out.'); // But the promise still failed
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
