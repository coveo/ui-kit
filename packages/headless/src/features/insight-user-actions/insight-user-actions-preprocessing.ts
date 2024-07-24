/* eslint-disable @cspell/spellchecker */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {InsightUserActionSection} from '../../state/state-sections';
import {
  UserAction,
  UserActionTimeline,
  UserActionType,
} from './insight-user-actions-state';

const mockActions: Object[] = [
  {
    name: 'CUSTOM', // (3)
    value:
      '{"event_type":"User Actions","event_value":"openUserActions","origin_level_1":"AgentPanel","origin_level_2":"All"}',
    time: '1719581379164', // Friday, June 28, 2024 1:29:39.164 PM
  },
  {
    name: 'CLICK', // (2)
    value:
      '{"c_contentidkey":"urihash","c_contentidvalue":"8FibZquZa6ChJWzF","language":"en","origin_level_1":"AgentPanel","origin_level_2":"All","title":"Update the documentation for the floor counter to clarify the \\"skipping floors\\" issues.","uri_hash":"8FibZquZa6ChJWzF"}',
    time: '1719581369248', // Friday, June 28, 2024 1:29:29.248 PM
  },
  {
    name: 'CLICK', // (1)
    value:
      '{"c_contentidkey":"urihash","c_contentidvalue":"8FibZquZa6ChJWzF","language":"en","origin_level_1":"AgentPanel","origin_level_2":"All","title":"Update the documentation for the floor counter to clarify the \\"skipping floors\\" issues.","uri_hash":"8FibZquZa6ChJWzF"}',
    time: '1719581367957', // Friday, June 28, 2024 1:29:27.957 PM
  },
  {
    name: 'SEARCH', // (5)
    value:
      '{"cause":"userActionLoad","origin_level_1":"AgentPanel","origin_level_2":"All"}',
    time: '1719581379516', // Friday, June 28, 2024 1:29:39.516 PM
  },
  {
    name: 'SEARCH', // (4)
    value:
      '{"cause":"userActionLoad","origin_level_1":"AgentPanel","origin_level_2":"All"}',
    time: '1719581379368', // Friday, June 28, 2024 1:29:39.368 PM
  },
];

interface rawUserAction {
  name: string;
  value: string;
  time: string;
}

export const preprocessActionsData = (
  state: InsightUserActionSection,
  actions: Array<rawUserAction>
): UserActionTimeline => {
  // Sort actions by most recent first
  const sortedActions: rawUserAction[] = sortActions(actions);

  // Filter out actions using excludedCustomActions
  let filteredActions = sortedActions;
  const excludedCustomActions = state.insightUserAction.excludedCustomActions;
  if (excludedCustomActions && excludedCustomActions.length > 0) {
    filteredActions = filterActions(sortedActions, excludedCustomActions);
  }

  // Map rawUserActions to UserAction objects
  const mappedUserActions = mapUserActions(filteredActions);

  // Split actions into sessions
  const sessions = splitActionsIntoSessions(mappedUserActions);

  // Find where the current session fits
  const ticketCreationDate = state.insightUserAction.ticketCreationDate;
  const currentSession = findCurrentSession(sessions, ticketCreationDate);

  // Build the sessions to display (the timeline)
  const sessionsToDisplay = buildSessionsToDisplay(sessions, currentSession);
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
  actions.filter((action) => {
    const actionValueObject = JSON.parse(action.value);
    const eventValue: string = actionValueObject.event_value;
    const eventType: string = actionValueObject.event_type;

    const shouldExcludeCustomAction =
      excludedCustomActions?.includes(eventValue) ||
      excludedCustomActions?.includes(eventType);

    return action.name !== 'CUSTOM' || shouldExcludeCustomAction;
  });
  return actions;
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

export const splitActionsIntoSessions = (actions: rawUserAction[]) => {};

export const findCurrentSession = () => {};

export const buildSessionsToDisplay = () => {};
