import {configuration} from '../../../app/common-reducers.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {logOpenUserActions} from '../../../features/insight-search/insight-analytics-actions.js';
import {
  fetchUserActions,
  registerUserActions,
} from '../../../features/insight-user-actions/insight-user-actions-actions.js';
import {insightUserActionsReducer} from '../../../features/insight-user-actions/insight-user-actions-slice.js';
import type {UserActionsState} from '../../../features/insight-user-actions/insight-user-actions-state.js';
import type {
  ConfigurationSection,
  InsightUserActionsSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

export type {
  UserAction,
  UserActionsState,
  UserSession,
} from '../../../features/insight-user-actions/insight-user-actions-state.js';

export interface UserActionsProps {
  /**
   * The options for the `UserActions` controller.
   */
  options: UserActionsOptions;
}

export interface UserActionsOptions {
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
 *
 * @group Controllers
 * @category UserActions
 */
export interface UserActions extends Controller {
  /**
   * Fetch the list of user actions surrounding the ticket creation.
   * @param userId The user ID to which the user's actions belong.
   */
  fetchUserActions(userId: string): void;
  /**
   * Emits an analytics event indicating that the user actions panel was opened.
   */
  logOpenUserActions(): void;
  /**
   * The state of the UserActions controller.
   */
  state: UserActionsState;
}

/**
 *
 * @param engine - The headless engine.
 * @param props - The configurable `UserActions` properties.
 * @returns A `UserActions` controller instance.
 *
 * @group Controllers
 * @category UserActions
 */
export function buildUserActions(
  engine: InsightEngine,
  props: UserActionsProps
): UserActions {
  if (!loadUserActionsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state.insightUserActions;
  const controller = buildController(engine);
  const {ticketCreationDate, excludedCustomActions} = props.options;

  dispatch(registerUserActions({ticketCreationDate, excludedCustomActions}));
  return {
    ...controller,

    get state() {
      return getState();
    },

    fetchUserActions(userId: string) {
      dispatch(fetchUserActions(userId));
    },

    logOpenUserActions() {
      dispatch(logOpenUserActions());
    },
  };
}

function loadUserActionsReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & InsightUserActionsSection> {
  engine.addReducers({
    configuration,
    insightUserActions: insightUserActionsReducer,
  });
  return true;
}
