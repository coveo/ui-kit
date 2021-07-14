/* eslint-disable node/no-unpublished-import */
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/definitions/index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/index';
import {LightningElement} from 'lwc';
import {Deferred} from 'utils';
import {CoreEngine} from './force-app/main/default/staticresources/coveoheadless/definitions/app/engine';

interface Bindings {
  engine?: HeadlessTypes<CoreEngine>;
  store?: Record<String, unknown>;
}

declare global {
  const CoveoHeadless: typeof HeadlessTypes;
  interface Window {
    coveoHeadless: {
      [engineId: string]: {
        components: {
          element: LightningElement;
          initialized: boolean;
        }[];
        options: Deferred<HeadlessTypes.ExternalEngineOptions>;
        bindings: Bindings;
        enginePromise: Promise;
        engineConstructor?: (
          options: HeadlessTypes.ExternalEngineOptions
        ) => unknown;
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
