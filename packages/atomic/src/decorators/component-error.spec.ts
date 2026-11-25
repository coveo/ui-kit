import {afterEach, beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {logComponentError} from './component-error';

describe('component-error', () => {
  describe('#logComponentError', () => {
    let consoleErrorSpy: MockInstance<typeof console.error>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log the error with its element', () => {
      const error = new Error('first');
      const element = document.createElement('div');

      logComponentError(error, element);

      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error, element);
    });

    it('should log each error instance only once, even from several elements', () => {
      const error = new Error('repeated');
      const firstElement = document.createElement('div');
      const secondElement = document.createElement('span');

      logComponentError(error, firstElement);
      logComponentError(error, firstElement);
      logComponentError(error, secondElement);

      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error, firstElement);
    });

    it('should log distinct error instances separately', () => {
      const element = document.createElement('div');
      const firstError = new Error('same message');
      const secondError = new Error('same message');

      logComponentError(firstError, element);
      logComponentError(secondError, element);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should log a value that is not an object every time', () => {
      const element = document.createElement('div');

      logComponentError('boom', element);
      logComponentError('boom', element);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith('boom', element);
    });
  });
});
