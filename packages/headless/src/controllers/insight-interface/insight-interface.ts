import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {
  configuration,
  insightConfiguration,
  insightInterface,
  searchHub,
} from '../../app/reducers';
import {fetchInterface} from '../../features/insight-interface/insight-interface-actions';
import {InsightInterfaceState} from '../../features/insight-interface/insight-interface-state';
import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightInterfaceSection,
  SearchHubSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * The `InsightInterface` controller is responsible for retrieving the Insight interface configuration.
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
