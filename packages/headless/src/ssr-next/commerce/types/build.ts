import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {OptionsTuple} from '../../common/types/utilities.js';
import type {CartInitialState} from '../controllers/cart/headless-cart.ssr.js';
import type {UserLocation} from '../controllers/context/headless-context.ssr.js';
import type {
  ParameterManagerState,
  Parameters,
} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
} from './controller-definitions.js';
import type {CommerceEngineDefinitionBuildResult} from './engine.js';

export interface SearchBuildConfig extends CommonBuildConfig {
  query: string;
}

export interface RecommendationBuildConfig extends CommonBuildConfig {
  recommendations?: []; // TODO: KIT-4619
}

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

export type BuildConfig<TSolutionType extends SolutionType> =
  TSolutionType extends SolutionType.search
    ? SearchBuildConfig
    : TSolutionType extends SolutionType.listing
      ? ListingBuildConfig
      : TSolutionType extends SolutionType.recommendation
        ? RecommendationBuildConfig
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
    BuildConfig<TSolutionType> &
      EngineDefinitionControllersPropsOption<
        TControllersDefinitionsMap,
        TControllersProps,
        TSolutionType
      >
  >
) => Promise<CommerceEngineDefinitionBuildResult<TControllersMap>>;
