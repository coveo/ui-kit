import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {HasKey, OptionsTuple} from '../../common/types/utilities.js';
import type {CartInitialState} from '../controllers/cart/headless-cart.ssr.js';
import type {ContextOptions} from '../controllers/context/headless-context.ssr.js';
import type {
  ParameterManagerState,
  Parameters,
} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  IsRecommendationController,
} from './controller-definitions.js';
import type {CommerceEngineDefinitionBuildResult} from './engine.js';

export interface SearchBuildConfig extends CommonBuildConfig {
  searchParams: ParameterManagerState<
    Parameters & {query: string}
  >['parameters'];
}

export interface ListingBuildConfig extends CommonBuildConfig {}

export interface StandaloneBuildConfig extends CommonBuildConfig {}

export interface CommonBuildConfig {
  context: ContextOptions;
  searchParams?: ParameterManagerState<Parameters>['parameters'];
  cart?: CartInitialState;
}

/**
 * Commerce engine options for SSR scenarios where context is defined when fetching static state.
 */
export type SSRCommerceEngineOptions = Omit<
  CommerceEngineOptions,
  'configuration'
> & {
  configuration: Omit<CommerceEngineOptions['configuration'], 'context'>;
};

/**
 * The `RecommendationBuildConfig` type defines the shape of the configuration object required when fetching static state for recommendations.
 *
 * The `recommendations` property is a string array containing the names of the recommendation controllers
 * that were defined in your engine definition. This allows you to specify which recommendation controllers
 * should be included in the SSR request.
 *
 * For example, on a storefront homepage, it might make sense to display a carousel of popular products.
 * However, showing recommendations based on items frequently bought together may not be relevant in that context and should not be retrieved unnecessarily.
 *
 * @example
 * Given the following engine definition:
 *
 * ```ts
 * const {recommendationEngineDefinition} = defineCommerceEngine({
 *   controllers: {
 *     popularProducts: defineRecommendations({options: {slotId: '...'}}),
 *     frequentlyBought: defineRecommendations({options: {slotId: '...'}}),
 *     // ...other controllers
 *   },
 * });
 *
 * // When fetching static state for recommendations:
 * const staticState = await recommendationEngineDefinition.fetchStaticState({
 *   recommendations: ['popularProducts'],
 *   // ...other config
 * });
 * ```
 *
 * In this example, only the `popularProducts` recommendation controller will be included in the SSR request.
 */
export type RecommendationBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = CommonBuildConfig & {
  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  productId?: string;
  /**
   * An array of recommendation controller names from your engine definition to include in the SSR request.
   * Each name corresponds to a key used when defining recommendation controllers in your engine definition.
   * If not specified, no recommendation requests will be executed.
   */
  recommendations: Array<
    Extract<
      keyof TControllers,
      {
        [K in keyof TControllers]: HasKey<
          TControllers[K],
          SolutionType.recommendation
        > extends never
          ? never
          : IsRecommendationController<TControllers[K]> extends never
            ? never
            : K;
      }[keyof TControllers]
    >
  >;
};

export interface ListingBuildConfig extends CommonBuildConfig {}

export interface StandaloneBuildConfig extends CommonBuildConfig {}

export interface CommonBuildConfig {
  context: ContextOptions;
  searchParams?: ParameterManagerState<Parameters>['parameters'];
  cart?: CartInitialState;
}

export type BuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.search
  ? SearchBuildConfig
  : TSolutionType extends SolutionType.listing
    ? ListingBuildConfig
    : TSolutionType extends SolutionType.recommendation
      ? RecommendationBuildConfig<TControllers>
      : TSolutionType extends SolutionType.standalone
        ? CommonBuildConfig
        : never;

/**
 * @internal
 */
export type Build<
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  ...params: OptionsTuple<
    BuildConfig<TControllersDefinitionsMap, TSolutionType> &
      EngineDefinitionControllersPropsOption<
        TControllersDefinitionsMap,
        TControllersProps,
        TSolutionType
      >
  >
) => Promise<CommerceEngineDefinitionBuildResult<TControllersMap>>;
