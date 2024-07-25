/* eslint-disable @cspell/spellchecker */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sortActions,
  filterActions,
  mapUserActions,
  splitActionsIntoSessions, // findCaseSubmitSession,
  buildTimeline,
} from './insight-user-actions-preprocessing';
import {UserActionType} from './insight-user-actions-state';

const mockRawUserActions = [
  {
    name: 'CUSTOM', // (2)
    value:
      '{"event_type":"User Actions","event_value":"openUserActions","origin_level_1":"AgentPanel"}',
    time: '1719581379164', // Friday, June 28, 2024 1:29:39.164 PM
  },
  {
    name: 'CLICK', // (1)
    value:
      '{"c_contentidkey":"urihash1","c_contentidvalue":"1","origin_level_1":"AgentPanel","title":"Title 1","uri_hash":"exampleUriHash"}',
    time: '1719581367957', // Friday, June 28, 2024 1:29:27.957 PM
  },
  {
    name: 'SEARCH', // (3)
    value:
      '{"cause":"userActionLoad","origin_level_1":"AgentPanel","origin_level_2":"All"}',
    time: '1719586800000', // Friday, June 28, 2024 3:00:00 PM (more than 30 min after the last action)
  },
];

const expectedSortedRawUserActions = [
  {
    name: 'SEARCH', // (3)
    value:
      '{"cause":"userActionLoad","origin_level_1":"AgentPanel","origin_level_2":"All"}',
    time: '1719586800000', //  Friday, June 28, 2024 3:00:00 PM (more than 30 min after the last action)
  },
  {
    name: 'CUSTOM', // (2)
    value:
      '{"event_type":"User Actions","event_value":"openUserActions","origin_level_1":"AgentPanel"}',
    time: '1719581379164', // Friday, June 28, 2024 1:29:39.164 PM
  },
  {
    name: 'CLICK', // (1)
    value:
      '{"c_contentidkey":"urihash1","c_contentidvalue":"1","origin_level_1":"AgentPanel","title":"Title 1","uri_hash":"exampleUriHash"}',
    time: '1719581367957', // Friday, June 28, 2024 1:29:27.957 PM
  },
];

const expectedMappedActions = [
  {
    actionType: 'SEARCH' as UserActionType,
    timestamp: '1719586800000', // Friday, June 28, 2024 3:00:00 PM (more than 30 min after the last action)
    eventData: {
      type: undefined,
      value: undefined,
    },
    cause: 'userActionLoad',
    searchHub: 'AgentPanel',
    document: {
      title: undefined,
      uriHash: undefined,
      contentIdKey: undefined,
      contentIdValue: undefined,
    },
    query: undefined,
  },
  {
    actionType: 'CUSTOM' as UserActionType,
    timestamp: '1719581379164', // Friday, June 28, 2024 1:29:39.164 PM
    eventData: {
      type: 'User Actions',
      value: 'openUserActions',
    },
    cause: undefined,
    searchHub: 'AgentPanel',
    document: {
      title: undefined,
      uriHash: undefined,
      contentIdKey: undefined,
      contentIdValue: undefined,
    },
    query: undefined,
  },
  {
    actionType: 'CLICK' as UserActionType,
    timestamp: '1719581367957', // Friday, June 28, 2024 1:29:27.957 PM
    eventData: {
      type: undefined,
      value: undefined,
    },
    cause: undefined,
    searchHub: 'AgentPanel',
    document: {
      title: 'Title 1',
      uriHash: 'exampleUriHash',
      contentIdKey: 'urihash1',
      contentIdValue: '1',
    },
    query: undefined,
  },
];

const expectedSessions = [
  {
    start: '1719586800000',
    end: '1719586800000',
    actions: [expectedMappedActions[0]],
  },
  {
    start: '1719581367957',
    end: '1719581379164',
    actions: [expectedMappedActions[1], expectedMappedActions[2]],
  },
];

describe('insight user actions preprocessing', () => {
  describe('#sortActions', () => {
    it('should properly sort the raw user actions by most recent to least recent', async () => {
      const sortedRawActions = sortActions(mockRawUserActions);
      expect(sortedRawActions).toEqual(expectedSortedRawUserActions);
    });
  });

  describe('#filterAction', () => {
    it('should properly filter the raw user actions given excludedCustomActions passed in the state', async () => {
      const mockExcludedCustomActions = ['CUSTOM'];
      const expectedFilteredActions = [
        expectedSortedRawUserActions[0],
        expectedSortedRawUserActions[2],
      ];
      const filteredActions = filterActions(
        expectedSortedRawUserActions,
        mockExcludedCustomActions
      );

      expect(filteredActions).toEqual(expectedFilteredActions);
    });
  });

  describe('#mapUserActions', () => {
    it('should properly map the raw user actions into UserAction objects', async () => {
      const mappedAction = mapUserActions(expectedSortedRawUserActions);
      expect(mappedAction).toEqual(expectedMappedActions);
    });
  });

  describe('#splitActionsIntoSessions', () => {
    it('should properly split user actions into sessions', async () => {
      const sessions = splitActionsIntoSessions(expectedMappedActions);
      expect(sessions).toEqual(expectedSessions);
    });
  });

  // TODO: Add tests for the following functions
  // describe('#findCaseSubmitSession', () => {
  //   it('should properly find the current session given the ticketCreationDate passed in the state', async () => {
  //     const ticketCreationDate = '1719581379164'; // Friday, June 28, 2024 1:29:39.164 PM
  //     const sessions = expectedSessions;
  //     const expectedCurrentSession = expectedSessions[1];

  //     const currentSession = findCaseSubmitSession(
  //       sessions,
  //       ticketCreationDate
  //     );
  //     expect(currentSession).toEqual(expectedCurrentSession);
  //   });
  // });

  // describe('#buildSessionsToDisplay', () => {
  //   it('should properly build sessions to be displayed', async () => {
  //     const result = buildSessionsToDisplay();
  //     expect(result).toEqual('something');
  //   });
  // });

  describe('#buildTimeline', () => {
    it('should properly build sessions to be displayed', async () => {
      const precedingSessions = [
        {
          start: '123',
          end: '321',
          actions: [{actionType: UserActionType.CLICK, timestamp: '123'}],
        },
      ];
      const currentSession = {
        start: '456',
        end: '654',
        actions: [
          {actionType: UserActionType.TICKET_CREATION, timestamp: '456'},
        ],
      };
      const followingSessions = [
        {
          start: '789',
          end: '987',
          actions: [{actionType: UserActionType.SEARCH, timestamp: '789'}],
        },
      ];

      const expectedTimelineObject = {
        precedingSessions: precedingSessions,
        session: currentSession,
        followingSessions: followingSessions,
      };

      const timeline = buildTimeline(
        precedingSessions,
        currentSession,
        followingSessions
      );
      expect(timeline).toEqual(expectedTimelineObject);
    });
  });
});
