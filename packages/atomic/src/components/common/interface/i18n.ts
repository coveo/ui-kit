import {getAssetPath} from '@stencil/core';
import Backend from 'i18next-http-backend';
import {AnyEngineType, BaseAtomicInterface} from './interface-common';

export function initi18n(atomicInterface: BaseAtomicInterface<AnyEngineType>) {
  return atomicInterface.i18n.use(Backend).init({
    debug: atomicInterface.logLevel === 'debug',
    lng: atomicInterface.language,
    fallbackLng: 'en',
    backend: {
      loadPath: `${getAssetPath(
        atomicInterface.languageAssetsPath
      )}/{{lng}}.json`,
    },
  });
}
