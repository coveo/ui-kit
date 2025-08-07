import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {CartInitialState} from '../controllers/cart/headless-cart.ssr.js';
import type {
  ParameterManagerState,
  Parameters,
} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  OptionsTuple,
} from './controller-definitions.js';
import type {BakedInControllers, EngineStaticState} from './engine.js';

export interface SearchFetchConfig extends CommonFetchConfig {
  query: string;
}

export interface RecommendationFetchConfig extends CommonFetchConfig {
  recommendations?: Array<{slotId: string; productId?: string}>;
}

export interface ListingFetchConfig extends CommonFetchConfig {}

export interface StandaloneFetchConfig extends CommonFetchConfig {}

export interface CommonFetchConfig {
  url: string; // TODO: what is the point of having the url for other solution types than search
  language: string;
  country: string;
  currency: string;
  cart?: CartInitialState;
  searchParams?: Omit<ParameterManagerState<Parameters>['parameters'], 'q'>;
}

// TODO: This should be in build type and not be called FetchStaticStateOptions because it is used by everyone
export type FetchStaticStateOptions<TSolutionType extends SolutionType> =
  TSolutionType extends SolutionType.search
    ? SearchFetchConfig
    : TSolutionType extends SolutionType.listing
      ? ListingFetchConfig
      : TSolutionType extends SolutionType.recommendation
        ? RecommendationFetchConfig
        : TSolutionType extends SolutionType.standalone
          ? CommonFetchConfig
          : never;

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  ...params: OptionsTuple<
    FetchStaticStateOptions<TSolutionType> &
      EngineDefinitionControllersPropsOption<
        TControllersDefinitionsMap,
        TControllersProps,
        TSolutionType
      >
  >
) => Promise<
  EngineStaticState<TSearchAction, TControllersStaticState & BakedInControllers>
>;
