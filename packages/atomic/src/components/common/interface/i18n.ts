import {getAssetPath} from '@stencil/core';
import Backend, {BackendOptions} from 'i18next-http-backend';
import {AnyEngineType, BaseAtomicInterface} from './interface-common';
import availableLocales from '../../../generated/availableLocales.json';

export const i18nTranslationNamespace = 'translation';

function isI18nLocaleAvailable(locale: string) {
  return availableLocales.includes(locale.toLowerCase());
}

export function i18nBackendOptions(
  atomicInterface: BaseAtomicInterface<AnyEngineType>
): BackendOptions {
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

export function initi18n(atomicInterface: BaseAtomicInterface<AnyEngineType>) {
  return atomicInterface.i18n.use(Backend).init({
    debug: atomicInterface.logLevel === 'debug',
    lng: atomicInterface.language,
    fallbackLng: 'en',
    backend: i18nBackendOptions(atomicInterface),
  });
}
