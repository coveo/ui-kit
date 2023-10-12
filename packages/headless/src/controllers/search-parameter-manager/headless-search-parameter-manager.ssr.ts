import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common.js';
import {
  SearchParameterManager,
  SearchParameterManagerInitialState,
  buildSearchParameterManager,
} from './headless-search-parameter-manager.js';

export * from './headless-search-parameter-manager.js';

/**
 * @internal
 */
export interface SearchParameterManagerBuildProps {
  initialState: SearchParameterManagerInitialState;
}

/**
 * @internal
 */
export const defineSearchParameterManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  SearchParameterManager,
  SearchParameterManagerBuildProps
> => ({
  buildWithProps: (engine, props) =>
    buildSearchParameterManager(engine, {initialState: props.initialState}),
});
