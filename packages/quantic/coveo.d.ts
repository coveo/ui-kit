/* eslint-disable node/no-unpublished-import */
import {InsightEngine, SearchEngine} from '@coveo/headless';
import {LightningElement} from 'lwc';
import {CoreEngine} from './force-app/main/default/staticresources/coveoheadless/definitions/app/engine';
import {ExternalEngineOptions} from './force-app/main/default/staticresources/coveoheadless/definitions/app/engine-configuration';
import * as HeadlessCaseAssistTypes from './force-app/main/default/staticresources/coveoheadless/definitions/case-assist.index';
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/definitions/index';
import * as HeadlessInsightTypes from './force-app/main/default/staticresources/coveoheadless/definitions/insight.index';

export * from './force-app/main/default/staticresources/coveoheadless/definitions/index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/case-assist.index';
export * from './force-app/main/default/staticresources/coveoheadless/definitions/insight.index';

interface Bindings {
  engine?:
    | HeadlessTypes<CoreEngine>
    | HeadlessCaseAssistTypes<CoreEngine>
    | HeadlessInsightTypes<CoreEngine>;
  store?: Record<String, unknown>;
}

declare global {
  const CoveoHeadless: typeof HeadlessTypes;
  const CoveoHeadlessCaseAssist: typeof HeadlessCaseAssistTypes;
  const CoveoHeadlessInsight: typeof HeadlessInsightTypes;
  type AnyHeadless =
    | CoveoHeadless
    | CoveoHeadlessCaseAssist
    | CoveoHeadlessInsight;

  type AnyEngine = SearchEngine | InsightEngine;

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
        bundle: AnyHeadless;
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
