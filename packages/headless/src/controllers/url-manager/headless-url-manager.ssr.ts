import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {
  UrlManager,
  UrlManagerInitialState,
  buildUrlManager,
} from './headless-url-manager';

export * from './headless-url-manager';

/**
 * @alpha
 */
export interface UrlManagerBuildProps {
  initialState: UrlManagerInitialState;
}

/**
 * @alpha
 */
export const defineUrlManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  UrlManager,
  UrlManagerBuildProps
> => ({
  buildWithProps: (engine, props) =>
    buildUrlManager(engine, {initialState: props.initialState}),
});
