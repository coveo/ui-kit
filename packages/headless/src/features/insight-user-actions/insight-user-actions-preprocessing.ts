import {
  UserAction,
  UserActionsState,
  UserActionTimeline,
  UserActionType,
  UserSession,
} from './insight-user-actions-state';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const SESSION_INACTIVITY_THRESHOLD_IN_MS = 30 * MINUTE;
const NUMBER_OF_PRECEDING_SESSIONS = 2;
const NUMBER_OF_FOLLOWING_SESSIONS = 2;

export interface RawUserAction {
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
export const preprocessActionsData = (
  state: UserActionsState,
  actions: Array<RawUserAction>
): UserActionTimeline => {
  if (!state.ticketCreationDate || actions.length === 0) {
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
    ticketCreationTimestamp
  );

  const filteredTimeline = filterTimelineActions(
    timeline,
    excludedCustomActions
  );

  return filteredTimeline;
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
      } catch (error) {
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
 * Checks if the timestamp is within a specified range.
 * @param timestamp {number} - The timestamp to check
 * @param startTimestamp {number} - The start timestamp
 * @param endTimestamp {number} - The end timestamp
 * @returns {boolean}
 */
const isTimestampInRange = (
  timestamp: number,
  startTimestamp: number,
  endTimestamp: number
): boolean => timestamp >= startTimestamp && timestamp <= endTimestamp;

/**
 * Inserts the session in the timeline at the right location.
 * @param currentSession {UserSession} - The current session
 * @param ticketCreationDate {number} - The ticket creation date
 * @param timeline {UserActionTimeline} - The timeline
 * @returns {void}
 */
const insertSessionInTimeline = (
  session: UserSession,
  ticketCreationDate: number,
  timeline: UserActionTimeline
) => {
  if (ticketCreationDate < session.start) {
    timeline.followingSessions.push(session);
  } else {
    timeline.precedingSessions.push(session);
  }
};

/**
 * Divides actions into sessions and organizes them in the timeline based on the ticket creation date. This function does the following:
 * 1) Iterates over the actions and groups them into sessions based on the session inactivity threshold.
 * 2) Inserts the case creation action in the current session.
 * 3) Inserts the session in the timeline at the right location.
 * 4) Returns the timeline with the current session, 2 preceding sessions and 2 following sessions.
 * @param actions {UserAction[]} - The actions to split
 * @param ticketCreationDate {string} - The ticket creation date
 * @returns {UserActionTimeline} - The timeline of user actions (current session and 2 preceding and following sessions)
 */
export const splitActionsIntoTimelineSessions = (
  actions: UserAction[],
  ticketCreationDate: number
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
    if (isActionWithinSessionThreshold(action, currentSession.end)) {
      currentSession.actions.push(action);
      currentSession.start = action.timestamp;
      return;
    }
    // We check if the case creation is within the current session or within the inactivity threshold after the end of the session.
    const isCaseCreationIsPartOfCurrentSession = isTimestampInRange(
      ticketCreationDate,
      currentSession.start,
      currentSession.end + SESSION_INACTIVITY_THRESHOLD_IN_MS
    );

    if (isCaseCreationIsPartOfCurrentSession) {
      let caseCreationActionInserted = false;
      const caseCreationAction: UserAction = {
        actionType: UserActionType.TICKET_CREATION,
        timestamp: ticketCreationDate,
        eventData: {},
      };

      currentSession.actions.forEach((action, index) => {
        if (caseCreationActionInserted) {
          return;
        }

        if (
          action.timestamp <= caseCreationAction.timestamp &&
          !caseCreationActionInserted
        ) {
          currentSession.actions.splice(index, 0, caseCreationAction);
          caseCreationActionInserted = true;
        }
      });
      returnTimeline.session = currentSession;
    } else {
      insertSessionInTimeline(
        currentSession,
        ticketCreationDate,
        returnTimeline
      );
    }

    currentSession = {
      start: action.timestamp,
      end: action.timestamp,
      actions: [action],
    };
  });

  // We add the last session to the timeline.
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

  // We return the current session and the 2 preceding and following sessions in the timeline.
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

const shouldExcludeAction = (
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
 * Filters the timeline actions to exclude custom actions where the type or value is included in the excludedCustomActions and also empty searches.
 * @param timeline {UserActionTimeline}
 * @param actionsToExclude {string[]}
 * @returns {UserActionTimeline}
 */
export const filterTimelineActions = (
  timeline: UserActionTimeline,
  actionsToExclude: string[]
): UserActionTimeline => {
  const filteredPrecedingSessions = timeline.precedingSessions.map(
    (session) => {
      const {start, end} = session;
      const filteredActions = session.actions.filter(
        (action) => !shouldExcludeAction(action, actionsToExclude)
      );
      return {start, end, actions: filteredActions};
    }
  );

  const filteredFollowingSessions = timeline.followingSessions.map(
    (session) => {
      const {start, end} = session;
      const filteredActions = session.actions.filter(
        (action) => !shouldExcludeAction(action, actionsToExclude)
      );
      return {start, end, actions: filteredActions};
    }
  );

  if (timeline.session) {
    const {start, end, actions} = timeline.session;
    const filteredActions = actions.filter(
      (action) => !shouldExcludeAction(action, actionsToExclude)
    );
    timeline.session = {start, end, actions: filteredActions};
  }

  const filteredTimeline = {
    precedingSessions: filteredPrecedingSessions,
    session: timeline.session,
    followingSessions: filteredFollowingSessions,
  };
  return filteredTimeline;
};
