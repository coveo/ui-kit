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
   * A per-request access token (for example, a per-user Coveo search token) to use for this
   * `hydrateStaticState()` call only.
   *
   * When provided, it overrides the access token from the engine definition configuration for this
   * call without mutating the shared definition. When omitted, the definition's configured access
   * token is used.
   *
   * Unlike `fetchStaticState()`, the engine returned by `hydrateStaticState()` outlives the call, so
   * it stays subscribed to `setAccessToken()` updates even when this option is provided.
   *
   * @remarks
   * The token passed to `fetchStaticState()` is NOT carried over here. If you passed an
   * `accessToken` to the matching `fetchStaticState()` call, you MUST pass the same token here,
   * otherwise the hydrated engine falls back to the definition's configured token and every
   * client-side request (facets, pagination, search-as-you-type) queries with the wrong
   * permissions.
   */
  accessToken?: string;
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
    // `accessToken` and `navigatorContext` are per-request options of `hydrateStaticState()` only;
    // `fromBuildResult` replays search actions on an already-built engine and never reads them, so
    // they are excluded here to avoid silently accepting a token/context that would have no effect.
    Omit<HydrateStaticStateOptions<TSearchAction>, 'accessToken' | 'navigatorContext'>,
    HydratedState<SSRCommerceEngine, TControllers>
  >;
};
