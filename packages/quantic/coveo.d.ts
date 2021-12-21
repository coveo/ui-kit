/* eslint-disable node/no-unpublished-import */
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/definitions/index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/case-assist.index';

import * as HeadlessCaseAssistTypes from './force-app/main/default/staticresources/coveoheadless/definitions/case-assist.index';

import {LightningElement} from 'lwc';
import {Deferred} from 'utils';
import {CoreEngine} from './force-app/main/default/staticresources/coveoheadless/definitions/app/engine';
import {ExternalEngineOptions} from './force-app/main/default/staticresources/coveoheadless/definitions/app/engine-configuration';

interface Bindings {
  engine?: HeadlessTypes<CoreEngine> | HeadlessCaseAssistTypes<CoreEngine>;
  store?: Record<String, unknown>;
}

declare global {
  const CoveoHeadless: typeof HeadlessTypes;
  const CoveoHeadlessCaseAssist: typeof HeadlessCaseAssistTypes;
  interface Window {
    coveoHeadless: {
      [engineId: string]: {
        components: {
          element: LightningElement;
          initialized: boolean;
        }[];
        options: Deferred<ExternalEngineOptions>;
        bindings: Bindings;
        enginePromise: Promise;
        engineConstructor?: (options: ExternalEngineOptions) => unknown;
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
