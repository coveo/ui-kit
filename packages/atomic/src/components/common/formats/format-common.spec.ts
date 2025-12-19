import {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {NumberFormatter} from './format-common';
import {
  defaultCurrencyFormatter,
  defaultNumberFormatter,
  dispatchNumberFormatEvent,
} from './format-common';

describe('format-common', () => {
  describe('#dispatchNumberFormatEvent', () => {
    let element: Element;
    let parentElement: Element;
    const formatter: NumberFormatter = vi.fn();

    beforeEach(() => {
      parentElement = document.createElement('div');
      element = document.createElement('div');
      parentElement.appendChild(element);
    });

    it('should dispatch a custom event with correct type and detail', async () => {
      const dispatchSpy = vi
        .spyOn(element, 'dispatchEvent')
        .mockImplementation((event) => {
          expect(event).toBeInstanceOf(CustomEvent);
          expect((event as CustomEvent).type).toBe('atomic/numberFormat');
          expect((event as CustomEvent).detail).toBe(formatter);
          return false;
        });

      await expect(
        dispatchNumberFormatEvent(formatter, element)
      ).resolves.not.toThrow();
      dispatchSpy.mockRestore();
    });

    it('should throw if dispatchEvent returns true', async () => {
      vi.spyOn(element, 'dispatchEvent').mockReturnValue(true);

      await expect(
        dispatchNumberFormatEvent(formatter, element)
      ).rejects.toThrowError(
        'The Atomic number format component was not handled, as it is not a child of a compatible component'
      );
    });

    it('should wait for LitElement parent updateComplete before dispatching', async () => {
      const mockLitParent = document.createElement('div') as Element;
      Object.setPrototypeOf(mockLitParent, LitElement.prototype);

      let updateCompleteCalled = false;
      Object.defineProperty(mockLitParent, 'updateComplete', {
        get: () => {
          updateCompleteCalled = true;
          return Promise.resolve(true);
        },
      });

      const childElement = document.createElement('div');
      mockLitParent.appendChild(childElement);

      const dispatchSpy = vi
        .spyOn(childElement, 'dispatchEvent')
        .mockReturnValue(false);

      await dispatchNumberFormatEvent(formatter, childElement);

      expect(updateCompleteCalled).toBe(true);
      expect(dispatchSpy).toHaveBeenCalled();
      dispatchSpy.mockRestore();
    });

    it('should wait for Stencil element componentOnReady before dispatching', async () => {
      const mockStencilParent = document.createElement('div') as Element & {
        componentOnReady: () => Promise<void>;
      };
      let componentOnReadyCalled = false;
      mockStencilParent.componentOnReady = vi.fn(() => {
        componentOnReadyCalled = true;
        return Promise.resolve();
      });

      const childElement = document.createElement('div');
      mockStencilParent.appendChild(childElement);

      const dispatchSpy = vi
        .spyOn(childElement, 'dispatchEvent')
        .mockReturnValue(false);

      await dispatchNumberFormatEvent(formatter, childElement);

      expect(componentOnReadyCalled).toBe(true);
      expect(mockStencilParent.componentOnReady).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalled();
      dispatchSpy.mockRestore();
    });

    it('should dispatch immediately for regular DOM elements', async () => {
      const regularParent = document.createElement('div');
      const childElement = document.createElement('div');
      regularParent.appendChild(childElement);

      const dispatchSpy = vi
        .spyOn(childElement, 'dispatchEvent')
        .mockReturnValue(false);

      await dispatchNumberFormatEvent(formatter, childElement);

      expect(dispatchSpy).toHaveBeenCalled();
      dispatchSpy.mockRestore();
    });
  });

  describe('#defaultNumberFormatter', () => {
    it('should format number using locale string', () => {
      const value = 1234567.89;
      const languages = ['en-US'];
      const result = defaultNumberFormatter(value, languages);
      const expected = value.toLocaleString(languages);
      expect(result).toBe(expected);
    });

    it('should format zero correctly', () => {
      const result = defaultNumberFormatter(0, ['en-US']);
      const expected = (0).toLocaleString(['en-US']);
      expect(result).toBe(expected);
    });
  });

  describe('#defaultCurrencyFormatter', () => {
    it('should format currency using locale and currency code', () => {
      const value = 9876.54;
      const languages = ['de-DE'];
      const currencyFormatter = defaultCurrencyFormatter('EUR');
      const result = currencyFormatter(value, languages);
      const expected = value.toLocaleString(languages, {
        style: 'currency',
        currency: 'EUR',
      });
      expect(result).toBe(expected);
    });
  });
});
