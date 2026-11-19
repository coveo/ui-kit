import {getSampleConfiguration} from '../env.js';
import {formatPrice} from '../utils.js';

/** A price formatter bound to the sample's configured language, country and currency. */
export function useFormatPrice(): (price: number) => string {
  const {language, country, currency} = getSampleConfiguration();
  return (price) => formatPrice(price, {locale: `${language}-${country}`, currency});
}
