import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';

/**
 * The locale settings that the `updateLocale` method of the commerce interfaces accepts.
 */
export interface CommerceLocale {
  language?: string;
  country?: string;
  currency?: CurrencyCodeISO4217;
}

export function isCommerceLocale(value: unknown): value is CommerceLocale {
  return typeof value === 'object' && value !== null;
}

/**
 * Combines a language and a country into a locale, for example `fr` and `CA` into `fr-CA`.
 *
 * Returns the language unchanged when there is no country, when the language already has a
 * region, or when the combination is not a valid locale.
 */
export function withCountry(language: string, country?: string) {
  if (!country) {
    return language;
  }

  try {
    if (new Intl.Locale(language).region) {
      return language;
    }

    return new Intl.Locale(language, {region: country}).toString();
  } catch {
    return language;
  }
}
