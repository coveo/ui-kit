/**
 * Combines a language and a country into a locale, for example `fr` and `CA` into `fr-CA`.
 *
 * Returns the language unchanged when there is no country, when the language already has a
 * region, or when the combination is not a valid locale.
 */
export function withCountry(language: string, country?: string) {
  if (!country || language.includes('-')) {
    return language;
  }

  try {
    return Intl.getCanonicalLocales(`${language}-${country}`)[0];
  } catch {
    return language;
  }
}
