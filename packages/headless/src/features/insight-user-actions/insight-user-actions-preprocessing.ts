import {
  UserAction,
  UserActionsState,
  UserActionTimeline,
  UserActionType,
  UserSession,
} from './insight-user-actions-state';

const MSEC_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MAX_MINUTES_IN_SESSION = 30;
const THIRTY_MINUTES =
  MAX_MINUTES_IN_SESSION * SECONDS_IN_MINUTE * MSEC_IN_SECOND;

interface rawUserAction {
  name: string;
  value: string;
  time: string;
}

export const preprocessActionsData = (
  state: UserActionsState,
  actions: Array<rawUserAction>
): UserActionTimeline => {
  const ticketCreationDate = state.ticketCreationDate;
  const excludedCustomActions = state.excludedCustomActions;

  if (!ticketCreationDate || actions.length === 0) {
    return {
      precedingSessions: [],
      session: undefined,
      followingSessions: [],
      caseSessionFound: false,
    };
  }

  const processedRawActions = buildUserActionFromRawAction(actions);

  const timeline = splitActionsIntoTimelineSessions(
    processedRawActions,
    ticketCreationDate
  );

  const filteredTimeline = filterTimelineActions(
    timeline,
    excludedCustomActions
  );

  return filteredTimeline;
};

export const buildUserActionFromRawAction = (
  rawActions: rawUserAction[]
): UserAction[] => {
  const mappedUserActions = rawActions
    .map((rawAction) => {
      const actionData = JSON.parse(rawAction.value);
      return {
        actionType: rawAction.name as UserActionType,
        timestamp: rawAction.time,
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
          contentIdKey: actionData.c_contentidkey,
          // eslint-disable-next-line @cspell/spellchecker
          contentIdValue: actionData.c_contentidvalue,
        },
        query: actionData.query_expression,
      };
    })
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return mappedUserActions;
};

/**
 * Splits the actions into sessions and build the timeline.
 * @param actions {UserAction[]} - The actions to split
 * @param ticketCreationDate {string} - The ticket creation date
 * @returns {UserActionTimeline}
 */
export const splitActionsIntoTimelineSessions = (
  actions: UserAction[],
  ticketCreationDate: string
): UserActionTimeline => {
  const returnTimeline: UserActionTimeline = {
    precedingSessions: [],
    session: undefined,
    followingSessions: [],
    caseSessionFound: false,
  };

  let currentSession: UserSession = {
    start: actions[0].timestamp,
    end: actions[0].timestamp,
    actions: [],
  };

  actions.forEach((action) => {
    if (isActionWithin30Minutes(action, currentSession.end)) {
      currentSession.actions.push(action);
      currentSession.start = action.timestamp;
      return;
    }

    if (sessionHasTicketCreation(currentSession, ticketCreationDate)) {
      returnTimeline.session = currentSession;
      returnTimeline.caseSessionFound = true;
      return;
    }

    if (sessionIsBeforeCaseCreation(currentSession, ticketCreationDate)) {
      returnTimeline.precedingSessions.push(currentSession);
      return;
    }

    returnTimeline.followingSessions.push(currentSession);

    currentSession = {
      start: action.timestamp,
      end: action.timestamp,
      actions: [action],
    };
  });

  // Inserting ticket creation action in current session
  const caseCreationSessionActions: UserAction[] | [] =
    insertTicketCreationActionInSession(
      returnTimeline.session,
      ticketCreationDate
    );

  const caseCreationSession = createCaseCreationSession(
    caseCreationSessionActions
  );
  returnTimeline.session = caseCreationSession;

  return returnTimeline;
};

/**
 * Checks if an action is within 30mins of the previous action.
 * @param action {UserAction} - The current action
 * @param previousTimestamp {string} - The timestamp of the previous action
 * @returns {boolean}
 */
export const isActionWithin30Minutes = (
  action: UserAction,
  previousTimestamp: string
): boolean => {
  return (
    Math.abs(Number(action.timestamp) - Number(previousTimestamp)) <
    THIRTY_MINUTES
  );
};

const sessionHasTicketCreation = (
  currentSession: UserSession,
  ticketCreationDate: string
): boolean => {
  return (
    currentSession.start <= ticketCreationDate &&
    ticketCreationDate <= currentSession.end
  );
};

const sessionIsBeforeCaseCreation = (
  currentSession: UserSession,
  ticketCreationDate: string
): boolean => {
  return currentSession.end < ticketCreationDate;
};

// Inserts ticket creation action in the current session at its correct position
export const insertTicketCreationActionInSession = (
  currentSession: UserSession | undefined,
  ticketCreationDate: string
): UserAction[] => {
  const ticketCreationAction: UserAction = {
    actionType: UserActionType.TICKET_CREATION,
    timestamp: ticketCreationDate,
  };

  // If no actions were pushed in the session, we return just the ticket creation action in the session
  if (currentSession === undefined) {
    return [ticketCreationAction];
  }

  let ticketCreationActionExists = false;

  currentSession.actions.forEach((action, index) => {
    if (!ticketCreationActionExists && action.timestamp < ticketCreationDate) {
      currentSession.actions.splice(index, 0, ticketCreationAction);
      ticketCreationActionExists = true;
    }
  });
  return currentSession.actions;
};

const createCaseCreationSession = (
  caseCreationSessionActions: UserAction[] | []
) => {
  const caseCreationSession: UserSession = {
    start:
      caseCreationSessionActions[caseCreationSessionActions.length - 1]
        .timestamp,
    end: caseCreationSessionActions[0].timestamp,
    actions: caseCreationSessionActions,
  };
  return caseCreationSession;
};

export const filterActions = (
  actions: UserAction[],
  excludedCustomActions: string[]
): UserAction[] => {
  const filteredActions = actions.filter((action) => {
    let shouldExcludeCustomAction = false;
    const eventType = action.eventData?.type || '';
    const eventValue = action.eventData?.value || '';

    if (eventType && eventValue) {
      shouldExcludeCustomAction =
        excludedCustomActions.includes(eventType) ||
        excludedCustomActions.includes(eventValue);
    }
    return (
      action.actionType !== UserActionType.CUSTOM || shouldExcludeCustomAction
    );
  });
  return filteredActions;
};

export const filterTimelineActions = (
  timeline: UserActionTimeline,
  actionsToExclude: string[]
): UserActionTimeline => {
  const filteredPrecedingSessions = timeline.precedingSessions.map(
    (session) => {
      const {start, end} = session;
      const filteredActions = filterActions(session.actions, actionsToExclude);
      return {start, end, actions: filteredActions};
    }
  );

  const filteredFollowingSessions = timeline.followingSessions.map(
    (session) => {
      const {start, end} = session;
      const filteredActions = filterActions(session.actions, actionsToExclude);
      return {start, end, actions: filteredActions};
    }
  );

  if (timeline.session) {
    const {start, end, actions} = timeline.session;
    const filteredActions = filterActions(actions, actionsToExclude);
    timeline.session = {start, end, actions: filteredActions};
  }

  const filteredTimeline = {
    precedingSessions: filteredPrecedingSessions,
    session: timeline.session,
    followingSessions: filteredFollowingSessions,
    caseSessionFound: timeline.caseSessionFound,
  };
  return filteredTimeline;
};
