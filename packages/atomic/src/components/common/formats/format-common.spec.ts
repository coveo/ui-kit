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
    const formatter: NumberFormatter = vi.fn();

    beforeEach(() => {
      element = document.createElement('div');
    });

    it('should dispatch a custom event with correct type and detail', () => {
      const dispatchSpy = vi
        .spyOn(element, 'dispatchEvent')
        .mockImplementation((event) => {
          expect(event).toBeInstanceOf(CustomEvent);
          expect((event as CustomEvent).type).toBe('atomic/numberFormat');
          expect((event as CustomEvent).detail).toBe(formatter);
          return false;
        });

      expect(() => dispatchNumberFormatEvent(formatter, element)).not.toThrow();
      dispatchSpy.mockRestore();
    });

    it('should throw if dispatchEvent returns true', () => {
      vi.spyOn(element, 'dispatchEvent').mockReturnValue(true);

      expect(() => dispatchNumberFormatEvent(formatter, element)).toThrowError(
        'The Atomic number format component was not handled, as it is not a child of a compatible component'
      );
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
