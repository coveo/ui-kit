import {getSampleConfiguration} from '../env.js';
import {formatPrice} from '../utils.js';

/**
 * A price formatter using the sample's configured language and country. Amounts default to the
 * configured currency; pass `currency` for amounts that carry their own, such as the cart's.
 */
export function useFormatPrice(currency?: string): (price: number) => string {
  const {language, country, currency: configuredCurrency} = getSampleConfiguration();
  return (price) =>
    formatPrice(price, {
      locale: `${language}-${country}`,
      currency: currency ?? configuredCurrency,
    });
}
