/* eslint-disable @cspell/spellchecker */

/* eslint-disable @typescript-eslint/no-unused-vars */
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
// const SESSION_BEFORE_TO_DISPLAY = 2;
// const SESSION_AFTER_TO_DISPLAY = 2;

// const mockActions: Object[] = [
//   {
//     name: 'CUSTOM', // (3)
//     value:
//       '{"event_type":"User Actions","event_value":"openUserActions","origin_level_1":"AgentPanel","origin_level_2":"All"}',
//     time: '1719581379164', // Friday, June 28, 2024 1:29:39.164 PM
//   },
//   {
//     name: 'CLICK', // (2)
//     value:
//       '{"c_contentidkey":"urihash","c_contentidvalue":"8FibZquZa6ChJWzF","language":"en","origin_level_1":"AgentPanel","origin_level_2":"All","title":"Update the documentation for the floor counter to clarify the \\"skipping floors\\" issues.","uri_hash":"8FibZquZa6ChJWzF"}',
//     time: '1719581369248', // Friday, June 28, 2024 1:29:29.248 PM
//   },
//   {
//     name: 'CLICK', // (1)
//     value:
//       '{"c_contentidkey":"urihash","c_contentidvalue":"8FibZquZa6ChJWzF","language":"en","origin_level_1":"AgentPanel","origin_level_2":"All","title":"Update the documentation for the floor counter to clarify the \\"skipping floors\\" issues.","uri_hash":"8FibZquZa6ChJWzF"}',
//     time: '1719581367957', // Friday, June 28, 2024 1:29:27.957 PM
//   },
//   {
//     name: 'SEARCH', // (5)
//     value:
//       '{"cause":"userActionLoad","origin_level_1":"AgentPanel","origin_level_2":"All"}',
//     time: '1719581379516', // Friday, June 28, 2024 1:29:39.516 PM
//   },
//   {
//     name: 'SEARCH', // (4)
//     value:
//       '{"cause":"userActionLoad","origin_level_1":"AgentPanel","origin_level_2":"All"}',
//     time: '1719581379368', // Friday, June 28, 2024 1:29:39.368 PM
//   },
// ];

interface rawUserAction {
  name: string;
  value: string;
  time: string;
}

type CaseSubmitSession = {
  caseSubmitSessionIndex: number;
  caseSubmitSession: UserSession | null;
};

// TODO: Change to: sort, map, split, findCaseSubmitSession, build preceding/following/current session, filter out actions, buildTimeline
export const preprocessActionsData = (
  state: UserActionsState,
  actions: Array<rawUserAction>
): UserActionTimeline | UserSession[] => {
  // Sort actions by most recent first
  const sortedActions: rawUserAction[] = sortActions(actions);

  // Map the rawUserActions from the api to UserAction objects
  const mappedUserActions = mapUserActions(sortedActions);

  // Split actions into sessions
  const sessions = splitActionsIntoSessions(mappedUserActions);

  // Checks if the ticketCreationDate is defined, if not, return last 5 sessions.
  const ticketCreationDate = state.ticketCreationDate;
  const excludedCustomActions = state.excludedCustomActions;
  if (!ticketCreationDate) {
    return returnLastFiveSessions(sessions, excludedCustomActions);
  }

  // Find in which session the ticket creation action is located. Returns the index and the session.
  const {caseSubmitSession, caseSubmitSessionIndex} = findCaseSubmitSession(
    sessions,
    ticketCreationDate
  );

  // IF: no sessions contain the ticket creation action, return the last 5 sessions.
  if (!caseSubmitSessionIndex || !caseSubmitSession) {
    return returnLastFiveSessions(sessions, excludedCustomActions);
  }
  // ELSE: We build the timeline with the current session including the ticket creation action.
  const precedingSessions = buildPrecedingSessions(
    sessions,
    caseSubmitSessionIndex,
    excludedCustomActions
  );

  const followingSessions = buildFollowingSessions(
    sessions,
    caseSubmitSessionIndex,
    excludedCustomActions
  );

  // Build the timeline object to be displayed.
  return buildTimeline(precedingSessions, caseSubmitSession, followingSessions);
};

export const sortActions = (actions: rawUserAction[]) => {
  const sortedActionsByMostRecent = (a: rawUserAction, b: rawUserAction) =>
    Number(b.time) - Number(a.time);

  return [...actions].sort(sortedActionsByMostRecent);
};

export const returnLastFiveSessions = (
  sessions: UserSession[],
  excludedCustomActions?: string[]
): UserSession[] => {
  const lastFiveSessions = sessions.slice(0, 5);
  if (excludedCustomActions && excludedCustomActions.length > 0) {
    const filteredLastFiveSessions: UserSession[] = lastFiveSessions.map(
      (session) => {
        const filteredSessionActions = filterActions(
          session.actions,
          excludedCustomActions
        );
        const filteredSession = {...session, actions: filteredSessionActions};
        return filteredSession;
      }
    );
    return filteredLastFiveSessions;
  }
  return lastFiveSessions;
};

export const filterActions = (
  actions: UserAction[],
  excludedCustomActions: string[]
): UserAction[] => {
  const filteredActions = actions.filter((action) => {
    const actionEventData = action.eventData;

    const excludedActionsIncludesActionType =
      typeof actionEventData?.type === 'string' &&
      excludedCustomActions.includes(actionEventData.type);

    const excludedActionsIncludesActionValue =
      typeof actionEventData?.value === 'string' &&
      excludedCustomActions.includes(actionEventData.value);

    const shouldExcludeCustomAction =
      excludedActionsIncludesActionType || excludedActionsIncludesActionValue;

    return action.actionType !== 'CUSTOM' || !shouldExcludeCustomAction;
  });
  console.log(filteredActions); // To remove later
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
        contentIdKey: actionData.c_contentidkey,
        contentIdValue: actionData.c_contentidvalue,
      },
      query: actionData.query_expression,
    };
  });
  return mappedUserActions;
};

export const splitActionsIntoSessions = (
  actions: UserAction[]
): UserSession[] => {
  if (actions.length === 0) {
    return [];
  }

  const initialSession: UserSession = {
    start: actions[0].timestamp,
    end: actions[0].timestamp,
    actions: [],
  };
  const splitSessions = [initialSession];

  let previousEndDateTime = initialSession?.end;
  let currentSession: UserSession = splitSessions[0];

  actions.forEach((action) => {
    if (isPartOfTheSameSession(action, previousEndDateTime)) {
      currentSession.actions.push(action);
      currentSession.start = action.timestamp;
    } else {
      splitSessions.push({
        start: action.timestamp,
        end: action.timestamp,
        actions: [action],
      });
      currentSession = splitSessions[splitSessions.length - 1];
    }
    previousEndDateTime = action.timestamp;
  });
  return splitSessions;
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

export const findCaseSubmitSession = (
  sessions: UserSession[],
  ticketCreationDate: string
): CaseSubmitSession => {
  let caseSubmitSessionIndex = null;
  let caseSubmitSession = null;
  // Find the session index that contains the ticket creation action
  caseSubmitSessionIndex = sessions.findIndex(
    (session) =>
      session.actions[0].timestamp >= ticketCreationDate &&
      session.actions[session.actions.length - 1].timestamp <=
        ticketCreationDate
  );

  if (caseSubmitSessionIndex && caseSubmitSessionIndex !== -1) {
    // If we found a session that correctly includes the timestamp when the ticket was created
    caseSubmitSession = sessions[caseSubmitSessionIndex];
  } else {
    // We can try to find a session that occurred just before the ticket create.
    caseSubmitSessionIndex = findPotentialSessionJustBeforeCaseSubmit(
      sessions,
      ticketCreationDate
    );
    // If we found a session that occured right before the ticket creation date
    if (caseSubmitSessionIndex !== -1) {
      caseSubmitSession = sessions[caseSubmitSessionIndex];
    }
  }
  // Returns the index and the session
  return {
    caseSubmitSessionIndex,
    caseSubmitSession,
  };
};

export const findPotentialSessionJustBeforeCaseSubmit = (
  sessions: UserSession[],
  ticketCreationDate: string
): number => {
  const potentialSessionIndex = sessions.findIndex(
    (session) => session.actions[0].timestamp <= ticketCreationDate
  );
  if (potentialSessionIndex !== -1) {
    const lastActionInSession = sessions[potentialSessionIndex].actions[0];
    if (!isPartOfTheSameSession(lastActionInSession, ticketCreationDate)) {
      // If the session before the ticket create is not part of the same session, create a standalone session.
      sessions.splice(potentialSessionIndex, 0, {
        start: ticketCreationDate,
        end: ticketCreationDate,
        actions: [
          {
            actionType: UserActionType.TICKET_CREATION,
            timestamp: ticketCreationDate,
          },
        ],
      } as UserSession);
    }
    return potentialSessionIndex;
  }
  return -1;
};

export const buildTicketCreationAction = (
  ticketCreationDate: string
): UserAction => {
  return {
    actionType: UserActionType.TICKET_CREATION,
    timestamp: ticketCreationDate,
  };
};

export const buildPrecedingSessions = (
  sessions: UserSession[],
  caseSubmitSessionIndex: number,
  excludedCustomActions?: string[]
): UserSession[] => {
  let precedingSessions = sessions.slice(
    caseSubmitSessionIndex + 1,
    caseSubmitSessionIndex + 3
  );
  if (excludedCustomActions && excludedCustomActions.length > 0) {
    precedingSessions = precedingSessions.map((session) => {
      const filteredActions = filterActions(
        session.actions,
        excludedCustomActions
      );
      return {...session, session: {actions: filteredActions}};
    });
  }
  return precedingSessions;
};

export const buildFollowingSessions = (
  sessions: UserSession[],
  caseSubmitSessionIndex: number,
  excludedCustomActions?: string[]
): UserSession[] => {
  let followingSessions = sessions.slice(
    caseSubmitSessionIndex - 2,
    caseSubmitSessionIndex
  );
  if (excludedCustomActions && excludedCustomActions.length > 0) {
    followingSessions = followingSessions.map((session) => {
      filterActions(session.actions, excludedCustomActions);
      return session;
    });
  }
  return followingSessions;
};

export const buildTimeline = (
  precedingSessions: UserSession[],
  currentSession: UserSession,
  followingSessions: UserSession[]
): UserActionTimeline => {
  const timeline: UserActionTimeline = {
    precedingSessions: precedingSessions,
    session: {
      start: currentSession.start,
      end: currentSession.end,
      actions: currentSession.actions,
    },
    followingSessions: followingSessions,
    caseSessionFound: true,
  };
  return timeline;
};
