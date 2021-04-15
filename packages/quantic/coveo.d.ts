/* eslint-disable node/no-unpublished-import */
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/definitions/index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/index';
import {LightningElement} from 'lwc';

declare global {
  // eslint-disable-next-line no-undef
  const CoveoHeadless: typeof HeadlessTypes;

  interface Window {
    coveoHeadless: {
      [engineId: string]: {
        components: {
          element: LightningElement;
          initialized: boolean;
        }[];
        config: HeadlessTypes.HeadlessConfigurationOptions;
        engine: HeadlessTypes.HeadlessEngine;
      };
    };
  }
}
