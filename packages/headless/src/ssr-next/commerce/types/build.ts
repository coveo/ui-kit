import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {HasKey, OptionsTuple} from '../../common/types/utilities.js';
import type {CartInitialState} from '../controllers/cart/headless-cart.ssr.js';
import type {UserLocation} from '../controllers/context/headless-context.ssr.js';
import type {
  ParameterManagerState,
  Parameters,
} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionBuildResult,
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  IsRecommendationController,
} from './controller-definitions.js';

export interface SearchBuildConfig extends CommonBuildConfig {
  query: string;
}

/**
 * RecommendationBuildConfig defines the shape of the config object required when fetching static state for recommendations.
 *
 * The `recommendations` property is a string array containing the names of the recommendation controllers
 * that were defined in your engine definition. This allows you to specify which recommendation controllers
 * should be included in the SSR request.
 *
 * For example, given the following engine definition:
 *
 * ```ts
 * const {recommendationEngineDefinition} = defineCommerceEngine({
 *   controllers: {
 *     popularViewed: defineRecommendations({options: {slotId: '...'}}),
 *     popularBought: defineRecommendations({options: {slotId: '...'}}),
 *     viewedTogether: defineRecommendations({options: {slotId: '...'}}),
 *     // ...other controllers
 *   },
 * });
 *
 * // When fetching static state for recommendations:
 * const staticState = await recommendationEngineDefinition.fetchStaticState({
 *   recommendations: ['popularBought', 'viewedTogether'],
 *   // ...other config
 * });
 * ```
 *
 * In this example, only the `popularBought` and `viewedTogether` recommendation controllers will be included in the SSR request.
 */
export type RecommendationBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = CommonBuildConfig & {
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
  url: string;
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  location?: UserLocation;
  cart?: CartInitialState;
  searchParams?: Omit<ParameterManagerState<Parameters>['parameters'], 'q'>;
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
 * Commerce engine options for SSR scenarios where context is defined when fetching static state.
 */
export type SSRCommerceEngineOptions = Omit<
  CommerceEngineOptions,
  'configuration'
> & {
  configuration: Omit<CommerceEngineOptions['configuration'], 'context'>;
};

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
