import {describe, expect, it} from 'vitest';
import {
  createCurrencyFormatter,
  createNumberFormatter,
  createUnitFormatter,
  formatCurrency,
  formatNumber,
  formatUnit,
} from './number-format-utils';

describe('number-format-utils', () => {
  const testLanguages = ['en-US'];
  const testValue = 1234.567;

  describe('#formatNumber', () => {
    it('should format a number with default options', () => {
      const result = formatNumber(testValue, testLanguages);
      expect(result).toBe('1,234.567');
    });

    it('should format a number with minimumIntegerDigits', () => {
      const result = formatNumber(testValue, testLanguages, {
        minimumIntegerDigits: 5,
      });
      expect(result).toBe('01,234.567');
    });

    it('should format a number with minimumFractionDigits', () => {
      const result = formatNumber(123, testLanguages, {
        minimumFractionDigits: 2,
      });
      expect(result).toBe('123.00');
    });

    it('should format a number with maximumFractionDigits', () => {
      const result = formatNumber(testValue, testLanguages, {
        maximumFractionDigits: 1,
      });
      expect(result).toBe('1,234.6');
    });

    it('should format a number with minimumSignificantDigits', () => {
      const result = formatNumber(123, testLanguages, {
        minimumSignificantDigits: 5,
      });
      expect(result).toBe('123.00');
    });

    it('should format a number with maximumSignificantDigits', () => {
      const result = formatNumber(testValue, testLanguages, {
        maximumSignificantDigits: 3,
      });
      expect(result).toBe('1,230');
    });

    it('should format a number with multiple options', () => {
      const result = formatNumber(testValue, testLanguages, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      });
      expect(result).toBe('1,234.57');
    });

    it('should format differently based on locale', () => {
      const germanResult = formatNumber(testValue, ['de-DE']);
      expect(germanResult).toBe('1.234,567');
    });
  });

  describe('#formatCurrency', () => {
    it('should format a number as USD currency', () => {
      const result = formatCurrency(testValue, testLanguages, {
        currency: 'USD',
      });
      expect(result).toBe('$1,234.57');
    });

    it('should format a number as EUR currency', () => {
      const result = formatCurrency(testValue, ['de-DE'], {
        currency: 'EUR',
      });
      expect(result).toBe('1.234,57\u00a0€');
    });

    it('should format a number as JPY currency (no decimal places)', () => {
      const result = formatCurrency(testValue, testLanguages, {
        currency: 'JPY',
      });
      expect(result).toBe('¥1,235');
    });

    it('should format currency with custom minimumFractionDigits', () => {
      const result = formatCurrency(100, testLanguages, {
        currency: 'USD',
        minimumFractionDigits: 3,
      });
      expect(result).toBe('$100.000');
    });

    it('should format currency with custom maximumFractionDigits', () => {
      const result = formatCurrency(testValue, testLanguages, {
        currency: 'USD',
        maximumFractionDigits: 0,
      });
      expect(result).toBe('$1,235');
    });
  });

  describe('#formatUnit', () => {
    it('should format a number with unit (short display)', () => {
      const result = formatUnit(testValue, testLanguages, {
        unit: 'liter',
      });
      expect(result).toBe('1,234.567 L');
    });

    it('should format a number with unit (long display)', () => {
      const result = formatUnit(16, testLanguages, {
        unit: 'liter',
        unitDisplay: 'long',
      });
      expect(result).toBe('16 liters');
    });

    it('should format a number with unit (narrow display)', () => {
      const result = formatUnit(16, testLanguages, {
        unit: 'liter',
        unitDisplay: 'narrow',
      });
      expect(result).toBe('16L');
    });

    it('should format a number with unit and custom fraction digits', () => {
      const result = formatUnit(testValue, testLanguages, {
        unit: 'meter',
        maximumFractionDigits: 1,
      });
      expect(result).toBe('1,234.6 m');
    });

    it('should format differently based on locale', () => {
      const germanResult = formatUnit(16, ['de-DE'], {
        unit: 'liter',
        unitDisplay: 'long',
      });
      expect(germanResult).toBe('16 Liter');
    });
  });

  describe('#createNumberFormatter', () => {
    it('should create a formatter with default options', () => {
      const formatter = createNumberFormatter();
      const result = formatter(testValue, testLanguages);
      expect(result).toBe('1,234.567');
    });

    it('should create a formatter with custom options', () => {
      const formatter = createNumberFormatter({
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const result = formatter(testValue, testLanguages);
      expect(result).toBe('1,234.57');
    });

    it('should create a reusable formatter', () => {
      const formatter = createNumberFormatter({
        maximumFractionDigits: 0,
      });
      expect(formatter(123.456, testLanguages)).toBe('123');
      expect(formatter(789.012, testLanguages)).toBe('789');
    });
  });

  describe('#createCurrencyFormatter', () => {
    it('should create a currency formatter', () => {
      const formatter = createCurrencyFormatter({
        currency: 'USD',
      });
      const result = formatter(testValue, testLanguages);
      expect(result).toBe('$1,234.57');
    });

    it('should create a currency formatter with custom options', () => {
      const formatter = createCurrencyFormatter({
        currency: 'EUR',
        minimumFractionDigits: 3,
      });
      const result = formatter(100, ['de-DE']);
      expect(result).toBe('100,000\u00a0€');
    });

    it('should create a reusable currency formatter', () => {
      const formatter = createCurrencyFormatter({
        currency: 'GBP',
      });
      expect(formatter(50, testLanguages)).toBe('£50.00');
      expect(formatter(999.99, testLanguages)).toBe('£999.99');
    });
  });

  describe('#createUnitFormatter', () => {
    it('should create a unit formatter', () => {
      const formatter = createUnitFormatter({
        unit: 'kilogram',
      });
      const result = formatter(testValue, testLanguages);
      expect(result).toBe('1,234.567 kg');
    });

    it('should create a unit formatter with custom display', () => {
      const formatter = createUnitFormatter({
        unit: 'meter',
        unitDisplay: 'long',
      });
      const result = formatter(5, testLanguages);
      expect(result).toBe('5 meters');
    });

    it('should create a unit formatter with custom options', () => {
      const formatter = createUnitFormatter({
        unit: 'celsius',
        maximumFractionDigits: 1,
      });
      const result = formatter(testValue, testLanguages);
      expect(result).toBe('1,234.6°C');
    });

    it('should create a reusable unit formatter', () => {
      const formatter = createUnitFormatter({
        unit: 'kilometer',
        unitDisplay: 'short',
      });
      expect(formatter(10, testLanguages)).toBe('10 km');
      expect(formatter(25.5, testLanguages)).toBe('25.5 km');
    });
  });
});
