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
