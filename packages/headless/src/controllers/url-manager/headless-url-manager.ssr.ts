import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  UrlManager,
  UrlManagerProps,
  buildUrlManager,
} from './headless-url-manager';

export * from './headless-url-manager';

/**
 * @internal
 */
export const defineUrlManager = (
  props: UrlManagerProps
): ControllerDefinitionWithoutProps<SearchEngine, UrlManager> => ({
  build: (engine) => buildUrlManager(engine, props),
});
