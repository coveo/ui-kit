import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {
  ControllerStaticStateMap,
  ControllersMap,
  ControllersPropsMap,
} from './controllers.js';
import type {
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
} from './engine.js';
import type {FromBuildResult} from './from-build-result.js';
import type {OptionsTuple} from './utilities.js';

type FetchStaticStateOptions = {
  /**
   * Whether to skip executing the search on the server side.
   * When true, the engine initializes without executing a search.
   *
   * @deprecated This option will be removed in the next major version.
   * Use separate engine definitions for search and standalone pages instead.
   *
   * @defaultValue `false`
   */
  skipSearch?: boolean;
};

export type FetchStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Set `skipSearch: true` in the parameters to skip search execution and only initialize controllers.
   * This is useful for standalone search boxes that don't need search results on initial load.
   *
   * Note: The `skipSearch` option is deprecated and will be removed in the next major version.
   *
   * Useful for static generation and server-side rendering.
   */
  (
    ...params: OptionsTuple<
      FetchStaticStateOptions &
        EngineDefinitionControllersPropsOption<TControllersProps>
    >
  ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

  /**
   * @deprecated Use the fetchStaticState() method instead
   */
  fromBuildResult: FromBuildResult<
    TEngine,
    TControllers,
    FetchStaticStateOptions,
    EngineStaticState<TSearchAction, TControllersStaticState>
  >;
};
