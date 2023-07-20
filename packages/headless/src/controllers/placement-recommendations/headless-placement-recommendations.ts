import {CommercePlacementsEngine} from '../../app/commerce-placement-engine/commerce-placement-engine';
import {getRecs} from '../../features/placement-set/placement-set-action';
import '../../features/placement-set/placement-set-interface';
import {
  PlacementSetSkus,
  PlacementSetView,
  Recommendations,
} from '../../features/placement-set/placement-set-interface';
import {placementSetReducer} from '../../features/placement-set/placement-set-slice';
import {PlacementSetState} from '../../features/placement-set/placement-set-state';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {Controller, buildController} from '../controller/headless-controller';
import {
  PlacementRecommendationsOptions,
  optionsSchema,
} from './headless-placement-recommendations-options';

export interface PlacementRecommendationsProps {
  /**
   * The initial options to apply to the `PlacementRecommendations` controller.
   */
  options: PlacementRecommendationsOptions;
}

export interface PlacementRecommendationsState {
  /**
   * A set of product recommendations returned by a specific Placement.
   */
  recommendations: Recommendations;

  /**
   * The SKUs used as seeds to get product recommendations from the Placement.
   */
  skus: PlacementSetSkus;

  /**
   * The current view context.
   */
  view: PlacementSetView;
}

export interface PlacementRecommendations extends Controller {
  /**
   * The state of the `PlacementRecommendations` controller.
   */
  state: PlacementRecommendationsState;

  /**
   * Requests product recommendations from the controller's placementId.
   *
   * This method is automatically called when the controller is created, and you should call it every time the
   * PlacementManager controller's view or skus is updated.
   */
  refresh(): void;

  // Tracking methods aren't implemented yet because callbacks aren't supported by the Unified Commerce API.

  /**
   * Not implemented
   */
  trackPlacementImpression(): void;

  /**
   * Not implemented
   * @param skus The skus
   */
  trackProductImpressions(skus: string[]): void;

  /**
   * Not implemented
   */
  trackPlacementClickthrough(): void;

  /**
   * Not implemented
   * @param sku The sku
   */
  trackProductClickthrough(sku: string): void;
}

/**
 * Creates a `PlacementRecommendations` controller instance.
 *
 * @param engine The headless Commerce Placements engine
 * @param props The configuration properties.
 * @returns The configurable `PlacementRecommendations` controller properties.
 */
export function buildPlacementRecommendations(
  engine: CommercePlacementsEngine,
  props: PlacementRecommendationsProps
): PlacementRecommendations {
  if (!loadPlacementSetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(
    engine,
    optionsSchema,
    options,
    'buildPlacementRecommendations'
  );

  dispatch(getRecs({placementId: options.placementId}));

  return {
    ...controller,

    get state() {
      return {
        skus: getState().placement.skus,
        view: getState().placement.view,
        recommendations:
          getState().placement.recommendations[options.placementId],
      };
    },

    refresh() {
      dispatch(getRecs({placementId: options.placementId}));
    },

    // Tracking methods aren't implemented yet because callbacks aren't supported by the Unified Commerce API.

    trackPlacementImpression() {
      return;
    },

    trackProductImpressions(skus: string[]) {
      skus;
      return;
    },

    trackPlacementClickthrough() {
      return;
    },

    trackProductClickthrough(sku: string) {
      sku;
      return;
    },
  };
}

function loadPlacementSetReducers(
  engine: CommercePlacementsEngine
): engine is CommercePlacementsEngine<PlacementSetState> {
  engine.addReducers({
    placementSetReducer,
  });
  return true;
}
