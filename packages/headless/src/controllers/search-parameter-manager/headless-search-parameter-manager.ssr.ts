import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {
  SearchParameterManager,
  SearchParameterManagerInitialState,
  buildSearchParameterManager,
} from './headless-search-parameter-manager';

export type {
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './headless-search-parameter-manager';

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
