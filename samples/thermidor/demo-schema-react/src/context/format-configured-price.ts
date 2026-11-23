import {getSampleConfiguration} from '../env.js';
import {formatPrice, PRICE_FIELDS} from '../utils.js';

/** Format a price in the sample's configured language, country and currency. */
export function formatConfiguredPrice(price: number, {compact = false} = {}): string {
  const {language, country, currency} = getSampleConfiguration();
  return formatPrice(price, {locale: `${language}-${country}`, currency, compact});
}

/** Format a facet or breadbox number: a price for price fields, a plain number otherwise. */
export function formatFieldNumber(field: string, value: number): string {
  return PRICE_FIELDS.has(field)
    ? formatConfiguredPrice(value, {compact: true})
    : value.toLocaleString();
}
