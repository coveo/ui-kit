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
        configuration: Deferred<EngineConfiguration>;
        engineConstructor: (
          options: HeadlessTypes.ExternalEngineOptions
        ) => HeadlessTypes.CoreEngine;
        engine: Promise<HeadlessTypes.CoreEngine>;
        initializedCallback?: Function;
      };
    };
  }
}

class Deferred<T> {
  promise: Promise<T>;
  isResolved: boolean;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}
