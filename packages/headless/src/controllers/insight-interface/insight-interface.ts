import {configuration} from '../../app/common-reducers.js';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {insightConfigurationReducer as insightConfiguration} from '../../features/insight-configuration/insight-configuration-slice.js';
import {fetchInterface} from '../../features/insight-interface/insight-interface-actions.js';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice.js';
import type {InsightInterfaceState} from '../../features/insight-interface/insight-interface-state.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import type {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightInterfaceSection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

/**
 * The `InsightInterface` controller is responsible for retrieving the Insight interface configuration.
 *
 * @group Controllers
 * @category InsightInterface
 */
export interface InsightInterface extends Controller {
  /**
   * Fetches the Insight interface configuration.
   */
  fetch(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `InsightInterface` controller.
   */
  state: InsightInterfaceState;
}

/**
 * Creates an `InsightInterface` controller instance.
 * @param engine  - The insight engine.
 * @returns An `InsightInterface controller instance.
 *
 * @group Controllers
 * @category InsightInterface
 */
export function buildInsightInterface(engine: InsightEngine): InsightInterface {
  if (!loadInsightInterfaceReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => {
    return engine.state;
  };

  return {
    ...controller,

    get state() {
      return getState().insightInterface;
    },

    fetch() {
      dispatch(fetchInterface());
    },
  };
}

function loadInsightInterfaceReducers(
  engine: InsightEngine
): engine is InsightEngine<
  ConfigurationSection &
    InsightConfigurationSection &
    InsightInterfaceSection &
    SearchHubSection
> {
  engine.addReducers({
    configuration,
    insightConfiguration,
    insightInterface,
    searchHub,
  });
  return true;
}
