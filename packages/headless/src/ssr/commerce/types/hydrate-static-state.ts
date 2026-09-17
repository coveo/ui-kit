import type {UnknownAction} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllersMap, ControllersPropsMap} from '../../common/types/controllers.js';
import type {HydratedState} from '../../common/types/hydrate-static-state.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  OptionsTuple,
} from './controller-definitions.js';
import type {FromBuildResult} from './from-build-result.js';

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
  /**
   * The navigator context to use for this `hydrateStaticState()` call only.
   *
   * When provided, it is applied to this call's engine without mutating the shared definition.
   * Pass the same navigator context that was used to fetch the static state so the hydrated engine
   * reports the same client ID and keeps the analytics session continuous. When omitted, the provider
   * set with `setNavigatorContextProvider` is used.
   */
  navigatorContext?: NavigatorContext;
}

export type HydrateStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  (
    ...params: OptionsTuple<
      HydrateStaticStateOptions<TSearchAction> &
        EngineDefinitionControllersPropsOption<
          TControllersDefinitionsMap,
          TControllersProps,
          TSolutionType
        >
    >
  ): Promise<HydratedState<SSRCommerceEngine, TControllers>>;

  /**
   * @deprecated Use the hydrateStaticState() method instead
   */
  fromBuildResult: FromBuildResult<
    TControllers,
    // `navigatorContext` is a per-request option of `hydrateStaticState()` only; `fromBuildResult`
    // replays search actions on an already-built engine and never reads it, so it is excluded here
    // to avoid silently accepting a context that would have no effect.
    Omit<HydrateStaticStateOptions<TSearchAction>, 'navigatorContext'>,
    HydratedState<SSRCommerceEngine, TControllers>
  >;
};
