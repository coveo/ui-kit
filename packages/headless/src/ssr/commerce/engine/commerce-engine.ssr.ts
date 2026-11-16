/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */

import type {CommerceEngineOptions as OriginalCommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import {buildLogger} from '../../../app/logger.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {withDeprecationWarning} from '../../../utils/deprecation.js';
import {createAccessTokenManager} from '../../common/access-token-manager.js';
import {buildFactory, type CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {hydratedRecommendationStaticStateFactory} from '../factories/recommendation-hydrated-state-factory.js';
import {fetchRecommendationStaticStateFactory} from '../factories/recommendation-static-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import {SolutionType} from '../types/controller-constants.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import type {EngineDefinition} from '../types/engine.js';

/**
 * @deprecated use `SSRCommerceEngineOptions` type instead.
 */
export type CommerceEngineOptions = OriginalCommerceEngineOptions;

export interface CommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> extends EngineDefinition<TControllers, CommerceEngineOptions, TSolutionType> {}

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 *
 * @group Engine
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): {
  listingEngineDefinition: CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>;
  searchEngineDefinition: CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>;
  standaloneEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.standalone
  >;
  recommendationEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.recommendation
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
  const deprecationLogger = buildLogger(options.loggerOptions);

  const deprecate = <TFunction extends (...args: never[]) => unknown>(
    fn: TFunction,
    api: string,
    instruction: string
  ) => withDeprecationWarning(deprecationLogger, fn, api, instruction);

  const warnOnExtendOption = <TFunction extends (...args: never[]) => unknown>(fn: TFunction) =>
    withDeprecationWarning(
      deprecationLogger,
      fn,
      'The `extend` build option',
      'Set the engine options, such as `middlewares` or `preprocessRequest` in the configuration, in `defineCommerceEngine()` instead.',
      (...args) => {
        const [buildOptions] = args as unknown[];
        return (
          typeof buildOptions === 'object' &&
          buildOptions !== null &&
          'extend' in buildOptions &&
          buildOptions.extend !== undefined
        );
      }
    );

  const withStaticStateWarnings = <
    TFunction extends ((...args: never[]) => unknown) & {
      fromBuildResult: (...args: never[]) => unknown;
    },
  >(
    fn: TFunction,
    name: 'fetchStaticState' | 'hydrateStaticState'
  ): TFunction => {
    const wrapped = warnOnExtendOption(fn);
    wrapped.fromBuildResult = deprecate(
      fn.fromBuildResult,
      `\`${name}.fromBuildResult\``,
      `Use \`${name}()\` instead.`
    );
    return wrapped;
  };

  const setNavigatorContextProvider = deprecate(
    (navigatorContextProvider: NavigatorContextProvider) => {
      engineOptions.navigatorContextProvider = navigatorContextProvider;
    },
    '`setNavigatorContextProvider`',
    'Pass a per-request `navigatorContext` to `fetchStaticState()` and `hydrateStaticState()` instead.'
  );

  const tokenManager = createAccessTokenManager(engineOptions.configuration.accessToken);

  const onAccessTokenUpdate = (updateCallback: (accessToken: string) => void, owner: object) => {
    tokenManager.registerCallback(updateCallback, owner);
  };

  /**
   * HACK: We assign engineOptions by reference (not by value) to definitionOptions
   * so that when setNavigatorContextProvider() modifies engineOptions.navigatorContextProvider,
   * the factories will see the updated navigator context when they are called later.
   *
   * This works because:
   * 1. setNavigatorContextProvider() modifies engineOptions.navigatorContextProvider
   * 2. definitionOptions points to the same object as engineOptions
   * 3. When fetchStaticState() is called, it uses the current value from the shared object
   *
   * Without this reference sharing, definitionOptions would be a snapshot taken at
   * definition time, and navigator context updates would be ignored.
   *
   * TODO: This will be removed in the next major version with a cleaner design
   * where context is provided directly to fetchStaticState() rather than through
   * the engine definition.
   */
  const definitionOptions = engineOptions;
  definitionOptions.onAccessTokenUpdate = onAccessTokenUpdate;

  const getAccessToken = deprecate(
    () => tokenManager.getAccessToken(),
    '`getAccessToken`',
    'Pass the access token to `fetchStaticState()` instead of reading it from the engine definition.'
  );
  const setAccessToken = deprecate(
    (accessToken: string) => {
      engineOptions.configuration.accessToken = accessToken;
      tokenManager.setAccessToken(accessToken);
    },
    '`setAccessToken`',
    'Pass the access token to `fetchStaticState()` and `hydrateStaticState()` instead. To rotate the token of an engine that is already running, configure `renewAccessToken`.'
  );

  const build = buildFactory<TControllerDefinitions>(controllerDefinitions, definitionOptions);
  const fetchStaticState = fetchStaticStateFactory<TControllerDefinitions>(
    controllerDefinitions,
    definitionOptions
  );
  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    controllerDefinitions,
    definitionOptions
  );
  const fetchRecommendationStaticState =
    fetchRecommendationStaticStateFactory<TControllerDefinitions>(
      controllerDefinitions,
      definitionOptions
    );
  const hydrateRecommendationStaticState =
    hydratedRecommendationStaticStateFactory<TControllerDefinitions>(
      controllerDefinitions,
      definitionOptions
    );

  return {
    listingEngineDefinition: {
      build: deprecate(
        warnOnExtendOption(build(SolutionType.listing)),
        '`build`',
        'Use `fetchStaticState()` instead.'
      ),
      fetchStaticState: withStaticStateWarnings(
        fetchStaticState(SolutionType.listing),
        'fetchStaticState'
      ),
      hydrateStaticState: withStaticStateWarnings(
        hydrateStaticState(SolutionType.listing),
        'hydrateStaticState'
      ),
      setNavigatorContextProvider,
      getAccessToken,
      setAccessToken,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>,
    searchEngineDefinition: {
      build: deprecate(
        warnOnExtendOption(build(SolutionType.search)),
        '`build`',
        'Use `fetchStaticState()` instead.'
      ),
      fetchStaticState: withStaticStateWarnings(
        fetchStaticState(SolutionType.search),
        'fetchStaticState'
      ),
      hydrateStaticState: withStaticStateWarnings(
        hydrateStaticState(SolutionType.search),
        'hydrateStaticState'
      ),
      setNavigatorContextProvider,
      getAccessToken,
      setAccessToken,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>,
    recommendationEngineDefinition: {
      build: deprecate(
        warnOnExtendOption(build(SolutionType.recommendation)),
        '`build`',
        'Use `fetchStaticState()` instead.'
      ),
      fetchStaticState: withStaticStateWarnings(fetchRecommendationStaticState, 'fetchStaticState'),
      hydrateStaticState: withStaticStateWarnings(
        hydrateRecommendationStaticState,
        'hydrateStaticState'
      ),
      setNavigatorContextProvider,
      getAccessToken,
      setAccessToken,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.recommendation>,
    // TODO KIT-3738 :  The standaloneEngineDefinition should not be async since no request is sent to the API
    standaloneEngineDefinition: {
      build: deprecate(
        warnOnExtendOption(build(SolutionType.standalone)),
        '`build`',
        'Use `fetchStaticState()` instead.'
      ),
      fetchStaticState: withStaticStateWarnings(
        fetchStaticState(SolutionType.standalone),
        'fetchStaticState'
      ),
      hydrateStaticState: withStaticStateWarnings(
        hydrateStaticState(SolutionType.standalone),
        'hydrateStaticState'
      ),
      setNavigatorContextProvider,
      getAccessToken,
      setAccessToken,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.standalone>,
  };
}
