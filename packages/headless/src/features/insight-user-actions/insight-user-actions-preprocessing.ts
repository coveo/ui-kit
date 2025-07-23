import {
  type UserAction,
  type UserActionsState,
  type UserActionTimeline,
  UserActionType,
  type UserSession,
} from './insight-user-actions-state.js';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const SESSION_INACTIVITY_THRESHOLD_IN_MS = 30 * MINUTE;
const NUMBER_OF_PRECEDING_SESSIONS = 2;
const NUMBER_OF_FOLLOWING_SESSIONS = 2;

interface RawUserAction {
  name: string;
  value: string;
  time: string;
}

/**
 * Preprocesses the raw user actions data from the API into a user actions timeline with the following steps:
 * - The data is first sorted by most recent and mapped into user actions.
 * - The actions are then split into sessions based on the ticket creation date.
 * - The sessions are then stored in the timeline object either as preceding, following or the case creation session.
 * - The timeline is then filtered to exclude custom actions passed in the state `excludedCustomActions` and empty search queries.
 * Note: The filtering is done at the end to avoid filtering out actions that would lead to incorrectly split a session into two by creating a gap.
 * @param state {UserActionsState} - The state of the user actions
 * @param actions {rawUserAction[]} - The raw user actions array to preprocess
 * @returns {UserActionTimeline}
 */
export const preprocessUserActionsData = (
  state: UserActionsState,
  actions: Array<RawUserAction>
): UserActionTimeline => {
  if (!state.ticketCreationDate || !actions?.length) {
    return {
      precedingSessions: [],
      session: undefined,
      followingSessions: [],
    };
  }

  const ticketCreationdate = new Date(state.ticketCreationDate);
  const ticketCreationTimestamp = ticketCreationdate.getTime();
  const excludedCustomActions = state.excludedCustomActions;

  const mappedAndSortedActions = mapAndSortActionsByMostRecent(actions);

  const timeline = splitActionsIntoTimelineSessions(
    mappedAndSortedActions,
    ticketCreationTimestamp,
    excludedCustomActions
  );

  return timeline;
};

const mapRawActionToUserAction = (rawAction: RawUserAction): UserAction => {
  const actionData = JSON.parse(rawAction.value);
  return {
    actionType: rawAction.name as UserActionType,
    timestamp: Number(rawAction.time),
    eventData: {
      type: actionData.event_type,
      value: actionData.event_value,
    },
    cause: actionData.cause,
    searchHub: actionData.origin_level_1,
    document: {
      title: actionData.title,
      uriHash: actionData.uri_hash,
      // eslint-disable-next-line @cspell/spellchecker
      contentIdKey: actionData.content_id_key || actionData.c_contentidkey,
      contentIdValue:
        // eslint-disable-next-line @cspell/spellchecker
        actionData.content_id_value || actionData.c_contentidvalue,
    },
    query: actionData.query_expression,
  };
};

/**
 * Sorts by most recent and maps the raw user actions into user actions.
 * We use reduce instead of map to drop any actions that could not be parsed.
 * @param rawUserActions {rawUserAction[]} - The raw user actions to sort and map
 * @returns {UserAction[]}
 */
export const mapAndSortActionsByMostRecent = (
  rawUserActions: RawUserAction[]
): UserAction[] => {
  let parsingError = false;
  const parsedActions = rawUserActions
    .reduce((acc, rawAction) => {
      try {
        const userAction: UserAction = mapRawActionToUserAction(rawAction);
        acc.push(userAction);
      } catch (_) {
        parsingError = true;
      }
      return acc;
    }, [] as UserAction[])
    .sort(
      (firstAction, secondAction) =>
        secondAction.timestamp - firstAction.timestamp
    );

  if (parsingError) {
    console.warn(
      'Some user actions could not be parsed. Please check the raw user actions data.'
    );
  }

  return parsedActions;
};

/**
 * Checks whether an action is within the same session as the latest action based on the specified session inactivity threshold.
 * @param action {UserAction} - The current action
 * @param latestTimestampInSession {number} - The timestamp of the latest action in the session
 * @returns {boolean}
 */
export const isActionWithinSessionThreshold = (
  action: UserAction,
  latestTimestampInSession: number
): boolean => {
  return (
    Math.abs(action.timestamp - latestTimestampInSession) <
    SESSION_INACTIVITY_THRESHOLD_IN_MS
  );
};

/**
 * Inserts the session in the timeline at the right location.
 * @param currentSession {UserSession} - The current session
 * @param ticketCreationDate {number} - The ticket creation date
 * @param timeline {UserActionTimeline} - The timeline
 * @returns {void}
 */
export const insertSessionInTimeline = (
  session: UserSession,
  ticketCreationDate: number,
  timeline: UserActionTimeline
) => {
  if (!session.actions?.length) {
    return;
  }

  if (
    ticketCreationDate >= session.start - SESSION_INACTIVITY_THRESHOLD_IN_MS &&
    ticketCreationDate <= session.end + SESSION_INACTIVITY_THRESHOLD_IN_MS
  ) {
    const ticketCreationAction: UserAction = {
      actionType: UserActionType.TICKET_CREATION,
      timestamp: ticketCreationDate,
      eventData: {},
    };

    let ticketCreationActionIndex = session.actions.findIndex((action) => {
      return action.timestamp <= ticketCreationAction.timestamp;
    });

    if (ticketCreationActionIndex === -1) {
      ticketCreationActionIndex = session.actions.length;
      session.start = ticketCreationDate;
    } else if (ticketCreationActionIndex === 0) {
      session.end = ticketCreationDate;
    }

    session.actions.splice(ticketCreationActionIndex, 0, ticketCreationAction);
    timeline.session = session;
  } else if (ticketCreationDate < session.start) {
    timeline.followingSessions.push(session);
  } else {
    timeline.precedingSessions.push(session);
  }
};

/**
 * Checks whether the action should be excluded from the session based on the excluded custom actions and empty searches.
 * @param action {UserAction} - The action to check
 * @param excludedCustomActions {string[]} - The custom actions to exclude
 * @returns {boolean}
 */
export const shouldExcludeAction = (
  action: UserAction,
  excludedCustomActions: string[]
): boolean => {
  if (action.actionType === UserActionType.SEARCH && !action.query) {
    return true;
  }

  if (action.actionType === UserActionType.CUSTOM) {
    const eventType = action.eventData?.type || '';
    const eventValue = action.eventData?.value || '';

    return (
      excludedCustomActions.includes(eventType) ||
      excludedCustomActions.includes(eventValue)
    );
  }
  return false;
};

/**
 * Divides actions into sessions and organizes them in the timeline based on the ticket creation date. This function does the following:
 * 1) Iterates over the actions and groups them into sessions based on the session inactivity threshold.
 * 2) Inserts the case creation action in the current session.
 * 3) Filters the actions in the current session to exclude custom actions where the type or value is included in the excludedCustomActions and also empty searches.
 * 4) Inserts the session in the timeline at the right location.
 * 5) Returns the timeline with the current session, 2 preceding sessions and 2 following sessions.
 * @param actions {UserAction[]} - The actions to split
 * @param ticketCreationDate {string} - The ticket creation date
 * @param actionsToExclude {string[]}
 * @returns {UserActionTimeline} - The timeline of user actions (current session and 2 preceding and following sessions)
 */
export const splitActionsIntoTimelineSessions = (
  actions: UserAction[],
  ticketCreationDate: number,
  actionsToExclude: string[]
): UserActionTimeline => {
  const returnTimeline: UserActionTimeline = {
    precedingSessions: [],
    session: undefined,
    followingSessions: [],
  };

  let currentSession: UserSession = {
    start: actions[0].timestamp,
    end: actions[0].timestamp,
    actions: [],
  };

  actions.forEach((action) => {
    if (isActionWithinSessionThreshold(action, currentSession.start)) {
      currentSession.actions.push(action);
      currentSession.start = action.timestamp;
      return;
    }

    currentSession.actions = currentSession.actions.filter(
      (action) => !shouldExcludeAction(action, actionsToExclude)
    );

    insertSessionInTimeline(currentSession, ticketCreationDate, returnTimeline);

    currentSession = {
      start: action.timestamp,
      end: action.timestamp,
      actions: [action],
    };
  });

  // We filter and add the last session to the timeline.
  currentSession.actions = currentSession.actions.filter(
    (action) => !shouldExcludeAction(action, actionsToExclude)
  );
  insertSessionInTimeline(currentSession, ticketCreationDate, returnTimeline);

  // If the case creation action was not part of any session added to the timeline.
  if (returnTimeline.session === undefined) {
    returnTimeline.session = {
      start: ticketCreationDate,
      end: ticketCreationDate,
      actions: [
        {
          actionType: UserActionType.TICKET_CREATION,
          timestamp: ticketCreationDate,
          eventData: {},
        },
      ],
    };
  }

  return {
    precedingSessions: returnTimeline.precedingSessions.slice(
      0,
      NUMBER_OF_PRECEDING_SESSIONS
    ),
    session: returnTimeline.session,
    followingSessions: returnTimeline.followingSessions.slice(
      returnTimeline.followingSessions.length - NUMBER_OF_FOLLOWING_SESSIONS
    ),
  };
};
