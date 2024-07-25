/* eslint-disable @cspell/spellchecker */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {InsightUserActionSection} from '../../state/state-sections';
import {
  UserAction,
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

export const preprocessActionsData = (
  state: InsightUserActionSection,
  actions: Array<rawUserAction>
): UserActionTimeline | UserSession[] => {
  // Sort actions by most recent first
  const sortedActions: rawUserAction[] = sortActions(actions);

  // Filter out actions using excludedCustomActions
  let filteredActions = sortedActions;
  const excludedCustomActions = state.insightUserAction.excludedCustomActions;
  if (excludedCustomActions && excludedCustomActions.length > 0) {
    filteredActions = filterActions(sortedActions, excludedCustomActions);
  }

  // Map the rawUserActions from the api to UserAction objects
  const mappedUserActions = mapUserActions(filteredActions);

  // Split actions into sessions
  const sessions = splitActionsIntoSessions(mappedUserActions);
  console.log(sessions); // To remove later

  // // Find where the current session fits
  // const ticketCreationDate = state.insightUserAction.ticketCreationDate;
  const sessionContainsTicketCreationAction = true; // TODO: Implement this function

  // IF: no sessions contain the ticket creation action, return the last 5 sessions.
  if (!sessionContainsTicketCreationAction) {
    return sessions.slice(0, 5);
  }
  // ELSE: We build the timeline with the current session including the ticket creation action.
  // const timeline = buildTimeline();
  // return timeline;
  return {
    precedingSessions: [],
    session: {
      start: '',
      end: '',
      actions: [],
    },
    followingSessions: [],
  };
};

export const sortActions = (actions: rawUserAction[]) => {
  const sortedActionsByMostRecent = (a: rawUserAction, b: rawUserAction) =>
    Number(b.time) - Number(a.time);

  return [...actions].sort(sortedActionsByMostRecent);
};

export const filterActions = (
  actions: rawUserAction[],
  excludedCustomActions?: string[]
) => {
  const filteredActions = actions.filter((action) => {
    const actionValueObject = JSON.parse(action.value);
    const eventValue: string = actionValueObject.event_value;
    const eventType: string = actionValueObject.event_type;

    const shouldExcludeCustomAction =
      excludedCustomActions?.includes(eventValue) ||
      excludedCustomActions?.includes(eventType);
    return action.name !== 'CUSTOM' || shouldExcludeCustomAction;
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
    Math.abs(Number(previousEndDateTime) - Number(action.timestamp)) <
    MAX_MSEC_IN_SESSION
  );
};

// export const buildSessionsToDisplay = (
//   sessions: UserSession[],
//   ticketCreationDate?: string
// ): UserSession[] => {
//   let sessionsToDisplay: UserSession[] = [];

//   if (typeof ticketCreationDate === 'string') {
//     const {caseSubmitSessionIndex, caseSubmitSession} = findCaseSubmitSession(
//       sessions,
//       ticketCreationDate
//     );
//     if (caseSubmitSessionIndex !== -1) {
//       const sessionIndexBefore =
//         caseSubmitSessionIndex - SESSION_BEFORE_TO_DISPLAY;
//       const sessionIndexAfter =
//         caseSubmitSessionIndex + SESSION_AFTER_TO_DISPLAY;

//       sessionsToDisplay = findSurroundingSessions(
//         sessionIndexBefore,
//         sessionIndexAfter,
//         sessions
//       );

//       const insertTicketCreationSessionIndex: number =
//         caseSubmitSession?.actions.findIndex(
//           (action) => action.timestamp <= ticketCreationDate
//         );
//       caseSubmitSession?.actions.splice(
//         insertTicketCreationSessionIndex,
//         0,
//         buildTicketCreationSession(ticketCreationDate)
//       );
//       return;
//     } else {
//       console.warn(
//         `Could not find a user action session corresponding to this date: ${ticketCreationDate}.`
//       );
//     }
//     return sessions;
//   }
//   return [];
// };

// // Returns the index nad the caseSubmitSession.
// export const findCaseSubmitSession = (
//   sessions: UserSession[],
//   ticketCreationDate: string
// ): {caseSubmitSessionIndex: number; caseSubmitSession: UserSession | null} => {
//   let caseSubmitSessionIndex = findSessionIncludingCaseSubmit(
//     sessions,
//     ticketCreationDate
//   );
//   let caseSubmitSession = null;

//   if (caseSubmitSessionIndex !== -1) {
//     // If we found a session that correctly includes the timestamp when the ticket was created
//     caseSubmitSession = sessions[caseSubmitSessionIndex];
//   } else {
//     // We try to find a session that occured right before the ticket creation date
//     caseSubmitSessionIndex = findPotentialSessionJustBeforeCaseSubmit(
//       sessions,
//       ticketCreationDate
//     );
//     if (caseSubmitSessionIndex !== -1) {
//       caseSubmitSession = sessions[caseSubmitSessionIndex];
//     }
//   }
//   return {
//     caseSubmitSessionIndex,
//     caseSubmitSession,
//   };
// };

// // Returns the index of the session containing the case submit action. Returns -1 if not found.
// export const findSessionIncludingCaseSubmit = (
//   sessions: UserSession[],
//   ticketCreationDate: string
// ): number => {
//   return sessions.findIndex(
//     (session) =>
//       session.actions[0].timestamp >= ticketCreationDate &&
//       session.actions[session.actions.length - 1].timestamp <=
//         ticketCreationDate
//   );
// };

// export const findPotentialSessionJustBeforeCaseSubmit = (
//   sessions: UserSession[],
//   ticketCreationDate: string
// ): number => {
//   const potentialSessionIndex = sessions.findIndex(
//     (session) => session.actions[0].timestamp <= ticketCreationDate
//   );
//   if (potentialSessionIndex !== -1) {
//     const lastActionInPotentialSession =
//       sessions[potentialSessionIndex].actions[0];

//     if (
//       !isPartOfTheSameSession(lastActionInPotentialSession, ticketCreationDate)
//     ) {
//       // If the session before the ticket create is not part of the same session, create a standalone session.
//       sessions.splice(potentialSessionIndex, 0, {
//         start: '',
//         end: '',
//         actions: [],
//       } as UserSession);
//     }
//     return potentialSessionIndex;
//   }
//   return -1;
// };

export const buildTicketCreationAction = (
  ticketCreationDate: string
): UserAction => {
  return {
    actionType: UserActionType.TICKET_CREATION,
    timestamp: ticketCreationDate,
  };
};

// export const findSurroundingSessions = (
//   from: number,
//   to: number,
//   sessions: UserSession[]
// ) => {
//   return sessions.slice(Math.max(0, from), Math.min(sessions.length, to + 1));
// };

// Builds the timeline object

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
  };
  return timeline;
};
