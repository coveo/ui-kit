import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common.js';
import {
  UrlManager,
  UrlManagerInitialState,
  buildUrlManager,
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
 */
export const defineUrlManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  UrlManager,
  UrlManagerBuildProps
> => ({
  buildWithProps: (engine, props) =>
    buildUrlManager(engine, {initialState: props.initialState}),
});
