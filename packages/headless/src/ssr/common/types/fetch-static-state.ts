import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {ControllerStaticStateMap, ControllersMap, ControllersPropsMap} from './controllers.js';
import type {EngineDefinitionControllersPropsOption, EngineStaticState} from './engine.js';
import type {FromBuildResult} from './from-build-result.js';
import type {OptionsTuple} from './utilities.js';

type FetchStaticStateOptions = {
  /**
   * The navigator context to use for this request only.
   *
   * When provided, it is applied to this request's engine without mutating the shared definition,
   * so concurrent requests do not read each other's client ID, user agent, or forwarded-for values.
   * When omitted, the provider set with `setNavigatorContextProvider` is used.
   */
  navigatorContext?: NavigatorContext;
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
   * Useful for static generation and server-side rendering.
   */
  (
    ...params: OptionsTuple<
      FetchStaticStateOptions & EngineDefinitionControllersPropsOption<TControllersProps>
    >
  ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

  /**
   * @deprecated Use the fetchStaticState() method instead
   */
  fromBuildResult: FromBuildResult<
    TEngine,
    TControllers,
    // `fromBuildResult` reuses an engine that is already built, so a navigator context would have no effect.
    Omit<FetchStaticStateOptions, 'navigatorContext'>,
    EngineStaticState<TSearchAction, TControllersStaticState>
  >;
};
