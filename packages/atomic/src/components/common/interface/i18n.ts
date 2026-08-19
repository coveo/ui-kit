import DOMPurify from 'dompurify';
import Backend, {type HttpBackendOptions} from 'i18next-http-backend';
import {getAssetPath} from '@/src/utils/asset-path-utils';
import availableLocales from '../../../generated/availableLocales.json';
import type {AnyEngineType} from './bindings';
import type {BaseAtomicInterface} from './interface-controller';

export const i18nTranslationNamespace = 'translation';
const FALLBACK_LANGUAGE = 'en';

export function i18nBackendOptions(
  atomicInterface: BaseAtomicInterface<AnyEngineType>
): HttpBackendOptions {
  return {
    loadPath: `${getAssetPath(
      atomicInterface.languageAssetsPath
    )}/{{lng}}.json?lng={{lng}}&ns={{ns}}`,
    request: async (_options, url, _payload, callback) => {
      try {
        const [fetchUrl, searchParams] = url.split('?');
        const urlParams = new URLSearchParams(searchParams);
        const lng = urlParams.get('lng')!;
        const ns = urlParams.get('ns')!;

        if (!isI18nLocaleAvailable(lng)) {
          throw new Error(`Unsupported locale "${lng}"`);
        }

        if (ns !== i18nTranslationNamespace) {
          throw new Error(`Unsupported namespace "${ns}"`);
        }

        const response = await fetch(fetchUrl);
        if (response.status !== 200 && response.status !== 304) {
          throw new Error(`Unsuccessful request returned status "${response.status}"`);
        }

        callback(null, {
          status: response.status,
          data: await response.json(),
        });
      } catch (error) {
        callback(error, {status: 404, data: ''});
      }
    },
  };
}

/**
 * Loads Atomic's own translations for `language` into the interface's i18next instance.
 *
 * The bundle is added with `deep: true, overwrite: false` so that strings the consumer has
 * already registered are preserved. Atomic's strings are defaults; an application that
 * customizes them should win, regardless of whether it registered its values before or after
 * this load resolves.
 */
export function loadTranslations(
  atomicInterface: BaseAtomicInterface<AnyEngineType>,
  language: string
) {
  const {i18n} = atomicInterface;
  const lng = language.split('-')[0];

  return new Promise<void>((resolve) => {
    new Backend(i18n.services, i18nBackendOptions(atomicInterface)).read(
      lng,
      i18nTranslationNamespace,
      (_error: unknown, data: unknown) => {
        if (data) {
          i18n.addResourceBundle(lng, i18nTranslationNamespace, data, true, false);
        }
        resolve();
      }
    );
  });
}

export async function init18n(atomicInterface: BaseAtomicInterface<AnyEngineType>) {
  const language = atomicInterface.language || FALLBACK_LANGUAGE;

  // The backend is deliberately not registered with `.use()`. Letting i18next's backend
  // connector load the initial resources is what caused it to discard the consumer's strings:
  // the connector stores what it loads with a shallow merge in which the incoming data wins.
  // Atomic loads the same resources itself, non-destructively, right below.
  const t = await atomicInterface.i18n.init({
    debug: atomicInterface.logLevel === 'debug',
    lng: atomicInterface.language,
    nsSeparator: '___',
    fallbackLng: FALLBACK_LANGUAGE,
    interpolation: {
      escape: (str) => DOMPurify.sanitize(str),
    },
    compatibilityJSON: 'v4',
  });

  await loadTranslations(atomicInterface, language);
  // i18next used to pull the fallback language too, as part of resolving the language
  // hierarchy. Keep doing so, otherwise a locale missing a key would render the key itself
  // instead of falling back to English.
  if (language.split('-')[0] !== FALLBACK_LANGUAGE) {
    await loadTranslations(atomicInterface, FALLBACK_LANGUAGE);
  }

  return t;
}

function isI18nLocaleAvailable(locale: string) {
  return availableLocales.includes(locale.toLowerCase());
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Record<string, Record<string, string>>;
  }
}
