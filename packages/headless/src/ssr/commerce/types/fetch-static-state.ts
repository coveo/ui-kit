import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllerStaticStateMap,
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  OptionsTuple,
} from './controller-definitions.js';
import type {EngineStaticState} from './engine.js';
import type {FromBuildResult} from './from-build-result.js';

/**
 * @deprecated This interface will be remove on the next major version.
 * Use BuildConfig interface instead
 */
export type FetchStaticStateOptions = {
  /**
   * A per-request access token (for example, a per-user Coveo search token) to use for this
   * `fetchStaticState()` call only.
   *
   * When provided, it overrides the access token from the engine definition configuration for this
   * request without mutating the shared definition, which is the supported way to use per-user
   * search tokens in a multi-tenant server process. When omitted, the definition's configured
   * access token is used.
   *
   * The resulting engine is request-scoped, so it is not subscribed to `setAccessToken()` updates:
   * a concurrent call on the shared definition cannot overwrite this token.
   *
   * @remarks
   * This token is NOT carried over to `hydrateStaticState()`. When you pass an `accessToken` here,
   * you MUST pass the same token to the matching `hydrateStaticState()` call, otherwise the hydrated
   * engine silently falls back to the definition's configured token and every client-side request
   * (facets, pagination, search-as-you-type) queries with the wrong permissions.
   */
  accessToken?: string;
};

export type FetchStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  (
    ...params: OptionsTuple<
      FetchStaticStateOptions &
        EngineDefinitionControllersPropsOption<
          TControllersDefinitionsMap,
          TControllersProps,
          TSolutionType
        >
    >
  ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

  /**
   * @deprecated Use the fetchStaticState() method instead
   */
  fromBuildResult: FromBuildResult<
    TControllers,
    // `accessToken` is a per-request option of `fetchStaticState()` only; `fromBuildResult`
    // re-executes an already-built engine and never reads it, so it is excluded here to avoid
    // silently accepting a token that would have no effect.
    Omit<FetchStaticStateOptions, 'accessToken'>,
    EngineStaticState<TSearchAction, TControllersStaticState>
  >;
};
