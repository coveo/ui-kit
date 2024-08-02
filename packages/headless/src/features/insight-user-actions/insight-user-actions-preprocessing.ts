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
const MAX_MSEC_IN_SESSION =
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

  // If there is no ticket creation date or no actions, we return an empty timeline.
  if (!ticketCreationDate || actions.length === 0) {
    return {
      precedingSessions: [],
      session: undefined,
      followingSessions: [],
      caseSessionFound: false,
    };
  }

  // Sort actions by most recent
  const sortedActions: rawUserAction[] = sortActions(actions);

  const mappedUserActions = mapUserActions(sortedActions);

  const timeline = splitActionsIntoTimelineSessions(
    mappedUserActions,
    ticketCreationDate
  );

  // Filter out custom actions to be excluded from the timeline
  const filteredTimeline = filterTimelineActions(
    timeline,
    excludedCustomActions
  );

  return filteredTimeline;
};

export const sortActions = (actions: rawUserAction[]) => {
  const sortedActionsByMostRecent = (a: rawUserAction, b: rawUserAction) =>
    Number(b.time) - Number(a.time);

  return [...actions].sort(sortedActionsByMostRecent);
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

export const mapUserActions = (rawActions: rawUserAction[]): UserAction[] => {
  const mappedUserActions = rawActions.map((rawAction) => {
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
  });
  return mappedUserActions;
};

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
    if (isPartOfTheSameSession(action, currentSession.end)) {
      currentSession.actions.push(action);
      currentSession.start = action.timestamp;
    } else {
      if (currentSessionHasTicketCreation(currentSession, ticketCreationDate)) {
        console.log('CURRENT SESSION HAS TICKET CREATION');
        returnTimeline.session = currentSession;
        returnTimeline.caseSessionFound = true;
      } else if (
        currentSessionIsBeforeCaseCreation(currentSession, ticketCreationDate)
      ) {
        // console.log('CURRENT SESSION IS BEFORE CASE CREATION');
        returnTimeline.precedingSessions.push(currentSession);
      } else {
        // console.log('CURRENT SESSION IS AFTER CASE CREATION');
        returnTimeline.followingSessions.push(currentSession);
      }
      currentSession = {
        start: action.timestamp,
        end: action.timestamp,
        actions: [],
      };
      currentSession.actions.push(action);
    }
  });

  // If no case session was found, we insert the session containing the ticket creation action in the timeline
  if (returnTimeline.session === undefined) {
    const caseCreationSession: UserSession = {
      start: ticketCreationDate,
      end: ticketCreationDate,
      actions: [buildTicketCreationAction(ticketCreationDate)],
    };
    returnTimeline.session = caseCreationSession;
  }
  return returnTimeline;
};

// Checks if an action is within 30mins of the previous action
export const isPartOfTheSameSession = (
  action: UserAction,
  previousEndDateTime: string
): boolean => {
  return (
    Math.abs(Number(action.timestamp) - Number(previousEndDateTime)) <
    MAX_MSEC_IN_SESSION
  );
};

const currentSessionHasTicketCreation = (
  currentSession: UserSession,
  ticketCreationDate: string
): boolean => {
  console.log('COMPARISON: ', ticketCreationDate <= currentSession.end);

  if (
    currentSession.start <= ticketCreationDate &&
    ticketCreationDate <= currentSession.end
  ) {
    return true;
  }
  return false;
};

const currentSessionIsBeforeCaseCreation = (
  currentSession: UserSession,
  ticketCreationDate: string
): boolean => {
  if (currentSession.end < ticketCreationDate) {
    return true;
  }
  return false;
};

export const buildTicketCreationAction = (
  ticketCreationDate: string
): UserAction => {
  return {
    actionType: UserActionType.TICKET_CREATION,
    timestamp: ticketCreationDate,
  };
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
