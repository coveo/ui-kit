/**
 * Options for formatting numbers.
 */
export interface NumberFormatOptions {
  /**
   * The minimum number of integer digits to use.
   */
  minimumIntegerDigits?: number;
  /**
   * The minimum number of fraction digits to use.
   */
  minimumFractionDigits?: number;
  /**
   * The maximum number of fraction digits to use.
   */
  maximumFractionDigits?: number;
  /**
   * The minimum number of significant digits to use.
   */
  minimumSignificantDigits?: number;
  /**
   * The maximum number of significant digits to use.
   */
  maximumSignificantDigits?: number;
}

/**
 * Options for formatting currency.
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  /**
   * The currency to use in currency formatting.
   * Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB.
   */
  currency: string;
}

/**
 * Options for formatting numbers with units.
 */
export interface UnitFormatOptions extends NumberFormatOptions {
  /**
   * The unit to use in unit formatting.
   * Must be a sanctioned unit identifier.
   * @see https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier
   */
  unit: string;
  /**
   * The unit formatting style to use.
   * - "long" (for example, 16 litres)
   * - "short" (for example, 16 l)
   * - "narrow" (for example, 16l)
   */
  unitDisplay?: 'long' | 'short' | 'narrow';
}

/**
 * Formats a number according to the specified options and locale.
 *
 * @param value - The number to format
 * @param languages - The language codes for locale-specific formatting
 * @param options - Optional formatting options
 * @returns The formatted number as a string
 */
export function formatNumber(
  value: number,
  languages: string[],
  options?: NumberFormatOptions
): string {
  return value.toLocaleString(languages, options);
}

/**
 * Formats a number as currency according to the specified options and locale.
 *
 * @param value - The number to format
 * @param languages - The language codes for locale-specific formatting
 * @param options - Currency formatting options (currency is required)
 * @returns The formatted currency as a string
 */
export function formatCurrency(
  value: number,
  languages: string[],
  options: CurrencyFormatOptions
): string {
  const {currency, ...numberOptions} = options;
  return value.toLocaleString(languages, {
    style: 'currency',
    currency,
    ...numberOptions,
  });
}

/**
 * Formats a number with a unit according to the specified options and locale.
 *
 * @param value - The number to format
 * @param languages - The language codes for locale-specific formatting
 * @param options - Unit formatting options (unit is required)
 * @returns The formatted number with unit as a string
 */
export function formatUnit(
  value: number,
  languages: string[],
  options: UnitFormatOptions
): string {
  const {unit, unitDisplay = 'short', ...numberOptions} = options;
  return value.toLocaleString(languages, {
    style: 'unit',
    unit,
    unitDisplay,
    ...numberOptions,
  });
}

/**
 * Creates a number formatter function with the specified options.
 * This is useful for creating reusable formatters.
 *
 * @param options - Optional formatting options
 * @returns A function that formats numbers with the given options
 */
export function createNumberFormatter(
  options?: NumberFormatOptions
): (value: number, languages: string[]) => string {
  return (value, languages) => formatNumber(value, languages, options);
}

/**
 * Creates a currency formatter function with the specified options.
 * This is useful for creating reusable formatters.
 *
 * @param options - Currency formatting options (currency is required)
 * @returns A function that formats numbers as currency with the given options
 */
export function createCurrencyFormatter(
  options: CurrencyFormatOptions
): (value: number, languages: string[]) => string {
  return (value, languages) => formatCurrency(value, languages, options);
}

/**
 * Creates a unit formatter function with the specified options.
 * This is useful for creating reusable formatters.
 *
 * @param options - Unit formatting options (unit is required)
 * @returns A function that formats numbers with units with the given options
 */
export function createUnitFormatter(
  options: UnitFormatOptions
): (value: number, languages: string[]) => string {
  return (value, languages) => formatUnit(value, languages, options);
}
