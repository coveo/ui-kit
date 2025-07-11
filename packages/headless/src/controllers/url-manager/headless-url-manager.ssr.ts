import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common.js';
import {MissingControllerProps} from '../../utils/errors.js';
import {
  buildUrlManager,
  type UrlManager,
  type UrlManagerInitialState,
} from './headless-url-manager.js';

export * from './headless-url-manager.js';

/**
 * @internal
 */
export interface UrlManagerBuildProps {
  initialState: UrlManagerInitialState;
}

/**
 * @internal
 * @group Definers
 *
 */
export const defineUrlManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  UrlManager,
  UrlManagerBuildProps
> => ({
  buildWithProps: (engine, props) => {
    if (props === undefined) {
      throw new MissingControllerProps('UrlManager');
    }
    return buildUrlManager(engine, {initialState: props.initialState});
  },
});
