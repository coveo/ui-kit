/* eslint-disable node/no-unpublished-import */
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/definitions/index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/index';
import {LightningElement} from 'lwc';
import {Deferred} from 'utils';
declare global {
  interface Window {
    coveoHeadless: {
      [engineId: string]: {
        components: {
          element: LightningElement;
          initialized: boolean;
        }[];
        options:
          | Deferred
          | {
              configuration: HeadlessConfigurationOptions;
              reducers: Reducers;
            };
        initializedCallback?: Function;
        engine: HeadlessTypes.HeadlessEngine;
      };
    };
  }
}
