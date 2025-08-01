import DOMPurify from 'dompurify';
import Backend, {type HttpBackendOptions} from 'i18next-http-backend';
import {getAssetPath} from '@/src/utils/asset-path-utils';
import availableLocales from '../../../generated/availableLocales.json';
import type {AnyEngineType} from './bindings';
import type {BaseAtomicInterface} from './interface-controller';

export const i18nTranslationNamespace = 'translation';

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
          throw new Error(
            `Unsuccessful request returned status "${response.status}"`
          );
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

export function init18n(atomicInterface: BaseAtomicInterface<AnyEngineType>) {
  return atomicInterface.i18n.use(Backend).init({
    debug: atomicInterface.logLevel === 'debug',
    lng: atomicInterface.language,
    nsSeparator: '___',
    fallbackLng: 'en',
    backend: i18nBackendOptions(atomicInterface),
    interpolation: {
      escape: (str) => DOMPurify.sanitize(str),
    },
    compatibilityJSON: 'v4',
  });
}

function isI18nLocaleAvailable(locale: string) {
  return availableLocales.includes(locale.toLowerCase());
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Record<string, Record<string, string>>;
  }
}
