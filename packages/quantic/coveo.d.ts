/* eslint-disable node/no-unpublished-import */
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/index';
export * from './force-app/main/default/staticresources/coveoheadless/index';
import {LightningElement} from 'lwc';
import {HeadlessEngine} from '../headless/dist/index';
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
        config: HeadlessConfigurationOptions;
        engine: HeadlessEngine;
      };
    };
  }
}
