import {UserActionTimeline} from '../../../api/service/insight/user-actions/user-actions-response';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {configuration, insightUserActions} from '../../../app/reducers';
import {
  fetchUserActions,
  registerUserActions,
} from '../../../features/insight-user-actions/insight-user-actions-actions';
import {InsightAPIErrorStatusResponse} from '../../../insight.index';
import {
  ConfigurationSection,
  InsightUserActionSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

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
   * The number of sessions to include occurring before the ticket creation session.
   * @defaultValue `0`
   */
  numberSessionsBefore?: number;
  /**
   * The number of sessions to include occurring after the ticket creation session.
   * @defaultValue `0`
   */
  numberSessionsAfter?: number;
  /**
   * The names of custom events to exclude.
   * @defaultValue `[]`
   */
  excludedCustomActions?: string[];
}

export interface UserActionsState {
  /**
   * The timeline of user actions.
   */
  timeline?: UserActionTimeline;
  /**
   * The number of sessions included before the ticket creation date.
   */
  numberSessionsBefore: number;
  /**
   * The number of sessions included after the ticket creation date.
   */
  numberSessionsAfter: number;
  /**
   * The names of custom actions to exclude from the user actions.
   */
  excludedCustomActions: string[];
  /**
   * The ticket creation date in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.
   */
  ticketCreationDate?: string;
  /**
   * `true` if fetching the user actions is in progress and `false` otherwise.
   */
  loading: boolean;
  /**
   * The error response if fetching the user actions failed.
   */
  error?: InsightAPIErrorStatusResponse;
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

  dispatch(registerUserActions(props.options));

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
  engine.addReducers({configuration, insightuserActions: insightUserActions});
  return true;
}
