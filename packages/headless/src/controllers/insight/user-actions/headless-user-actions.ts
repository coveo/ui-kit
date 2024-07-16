import {configuration} from '../../../app/common-reducers';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  fetchUserActions,
  registerUserActions,
} from '../../../features/insight-user-actions/insight-user-actions-actions';
import {insightUserActionsReducer} from '../../../features/insight-user-actions/insight-user-actions-slice';
import {UserActionsState} from '../../../features/insight-user-actions/insight-user-actions-state';
import {
  ConfigurationSection,
  InsightUserActionSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export type {UserActionsState} from '../../../features/insight-user-actions/insight-user-actions-state';

export interface UserActionsProps {
  /**
   * The options for the `UserActions` controller.
   */
  options: UserActionsOptions;
}

export interface UserActionsOptions {
  /**
   * The user ID to which the user's actions belong.
   */
  userId: string;
  /**
   * The ticket creation date in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.
   */
  ticketCreationDate: string;
  /**
   * The names of custom events to exclude.
   * @defaultValue `[]`
   */
  excludedCustomActions?: string[];
}

/**
 * The UserActions controller is responsible for fetching user actions surrounding a given case creation event.
 */
export interface UserActions extends Controller {
  /**
   * Fetch the list of user actions surrounding the ticket creation.
   */
  fetchUserActions(): void;
  /**
   * The state of the UserActions controller.
   */
  state: UserActionsState;
}

export function buildUserActions(
  engine: InsightEngine,
  props: UserActionsProps
): UserActions {
  if (!loadUserActionsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state.insightUserAction;
  const controller = buildController(engine);
  const {ticketCreationDate, userId, excludedCustomActions} = props.options;

  dispatch(
    registerUserActions({ticketCreationDate, userId, excludedCustomActions})
  );
  return {
    ...controller,

    get state() {
      return getState();
    },

    fetchUserActions() {
      dispatch(fetchUserActions());
    },
  };
}

function loadUserActionsReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & InsightUserActionSection> {
  engine.addReducers({
    configuration,
    insightuserActions: insightUserActionsReducer,
  });
  return true;
}
