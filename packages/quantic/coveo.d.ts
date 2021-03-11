/* eslint-disable node/no-unpublished-import */
import * as HeadlessTypes from './force-app/main/default/staticresources/coveoheadless/index';
export * from './force-app/main/default/staticresources/coveoheadless/index';
import * as AtomicTypes from './force-app/main/default/staticresources/atomicutils/types/utils-exports';
export * from './force-app/main/default/staticresources/atomicutils/types/utils-exports';
declare global {
  // eslint-disable-next-line no-undef
  const CoveoHeadless: typeof HeadlessTypes;
  // eslint-disable-next-line no-undef
  const CoveoAtomicUtils: typeof AtomicTypes;

  interface Window {
    coveoHeadless: {
      [x: string]: {
        components: {
          element: any;
          initialized: boolean;
        }[];
        engine: any;
      };
    };
  }
}
