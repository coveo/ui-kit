/* eslint-disable @cspell/spellchecker */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sortActions,
  filterActions,
  mapUserActions,
  splitActionsIntoSessions, // findCaseSubmitSession,
  buildTimeline,
  returnLastFiveSessions,
  isPartOfTheSameSession,
  buildTicketCreationAction,
  buildPrecedingSessions,
  buildFollowingSessions,
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

const mockMappedActions = [
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
    actions: [mockMappedActions[0]],
  },
  {
    start: '1719581367957',
    end: '1719581379164',
    actions: [mockMappedActions[1], mockMappedActions[2]],
  },
];

const mockSplitSessions = [
  {
    start: '1719603000000',
    end: '1719604000000',
    actions: mockMappedActions,
  },
  {
    start: '1719598400000',
    end: '1719599400000',
    actions: [],
  },
  {
    start: '1719593800000',
    end: '1719594800000',
    actions: [],
  },
  {
    start: '1719589200000',
    end: '1719590200000',
    actions: [
      {
        actionType: 'CUSTOM' as UserActionType,
        timestamp: '1719589260000',
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
    ],
  },
  {
    start: '1719584600000',
    end: '1719585600000',
    actions: [],
  },
  {
    start: '1719580000000',
    end: '1719581000000',
    actions: [],
  },
];

describe('insight user actions preprocessing', () => {
  describe('#sortActions', () => {
    it('should properly sort the raw user actions by most recent to least recent', async () => {
      const sortedRawActions = sortActions(mockRawUserActions);
      expect(sortedRawActions).toEqual(expectedSortedRawUserActions);
    });
  });

  describe('#returnLastFiveSessions', () => {
    describe('when there are no custom actions to be excluded', () => {
      it('should properly return the last five sessions', async () => {
        const expectedLastFiveSessions = mockSplitSessions.slice(0, 5);
        const lastFiveSessions = returnLastFiveSessions(mockSplitSessions);

        expect(lastFiveSessions.length).toEqual(5);
        expect(lastFiveSessions).toEqual(expectedLastFiveSessions);
      });
    });

    describe('when there are custom actions to be excluded', () => {
      it('should properly return the last five sessions with their actions filtered', async () => {
        const expectedLastFiveSessions = mockSplitSessions.slice(0, 5);
        const mockExcludedCustomActions = [
          'CUSTOM',
          'openUserActions',
          'User Actions',
        ];
        expectedLastFiveSessions[0].actions = [
          mockMappedActions[0],
          mockMappedActions[2],
        ];
        const lastFiveSessions = returnLastFiveSessions(
          mockSplitSessions,
          mockExcludedCustomActions
        );
        expect(lastFiveSessions.length).toEqual(5);
        expect(lastFiveSessions).toEqual(expectedLastFiveSessions);

        expect(lastFiveSessions[0].actions.length).toEqual(2);
        lastFiveSessions[0].actions.forEach((action) => {
          expect(action.actionType).not.toEqual(mockExcludedCustomActions[0]);
          expect(action?.eventData?.value).not.toEqual(
            mockExcludedCustomActions[1]
          );
          expect(action?.eventData?.type).not.toEqual(
            mockExcludedCustomActions[2]
          );
        });
      });
    });
  });

  describe('#filterAction', () => {
    it('should properly filter the raw user actions given excludedCustomActions passed in the state', async () => {
      const mockExcludedCustomActions = [
        'CUSTOM',
        'openUserActions',
        'User Actions',
      ];
      const expectedFilteredActions = [
        mockMappedActions[0],
        mockMappedActions[2],
      ];
      const filteredActions = filterActions(
        mockMappedActions,
        mockExcludedCustomActions
      );
      expect(filteredActions).toEqual(expectedFilteredActions);
      expect(filteredActions.length).toEqual(2);
    });
  });

  describe('#mapUserActions', () => {
    it('should properly map the raw user actions into UserAction objects', async () => {
      const mappedAction = mapUserActions(expectedSortedRawUserActions);
      expect(mappedAction).toEqual(mockMappedActions);
    });
  });

  describe('#splitActionsIntoSessions', () => {
    it('should properly split user actions into sessions', async () => {
      const sessions = splitActionsIntoSessions(mockMappedActions);
      expect(sessions).toEqual(expectedSessions);
    });
  });

  describe('#isPartOfTheSameSession', () => {
    it('should return true if the action is within 30mins of the previous', async () => {
      const action = mockMappedActions[0];
      // Added 1 min to action timestamp, so it is within 30 mins of the previous action
      const previousEndDateTime = '1719586860000';

      const isSameSession = isPartOfTheSameSession(action, previousEndDateTime);

      expect(isSameSession).toEqual(true);
    });

    it('should return false if the action is not within 30mins of the previous', async () => {
      const action = mockMappedActions[0];
      // Added 1 hour to action timestamp, so it is not within 30 mins of the previous action
      const previousEndDateTime = '1719590400000';

      const isSameSession = isPartOfTheSameSession(action, previousEndDateTime);

      expect(isSameSession).toEqual(false);
    });
  });

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

  describe('#findPotentialSessionJustBeforeCaseSubmit', () => {
    it('TODO', async () => {});
  });

  describe('#buildTicketCreationAction', () => {
    it('should properly return an object with the right user action type and timestamp', async () => {
      const ticketCreationDateTimeStamp = '1719586860000';
      const actionType = UserActionType.TICKET_CREATION;

      const expectedTicketCreationAction = {
        actionType: actionType,
        timestamp: ticketCreationDateTimeStamp,
      };

      const ticketCreationAction = buildTicketCreationAction(
        ticketCreationDateTimeStamp
      );

      expect(ticketCreationAction).toEqual(expectedTicketCreationAction);
    });
  });

  describe('#buildPrecedingSessions', () => {
    describe('when there are no custom actions to be excluded', () => {
      it('should return an array of two user sessions coming before the index of the current session', async () => {
        const mockCaseSubmitSessionIndex = 2;

        const expectedPrecedingSessions = mockSplitSessions.slice(
          mockCaseSubmitSessionIndex + 1,
          mockCaseSubmitSessionIndex + 3
        );
        const precedingSessions = buildPrecedingSessions(
          mockSplitSessions,
          mockCaseSubmitSessionIndex
        );

        expect(precedingSessions.length).toEqual(2);
        expect(precedingSessions).toEqual(expectedPrecedingSessions);

        precedingSessions.forEach((session, index) => {
          expect(session.start).toEqual(expectedPrecedingSessions[index].start);
          expect(session.end).toEqual(expectedPrecedingSessions[index].end);
        });
      });
    });
    describe('when there are custom actions to be excluded', () => {
      it('should return an array of two user sessions coming before the index of the current session with their actions filtered', async () => {
        const mockCaseSubmitSessionIndex = 2;
        const mockExcludedCustomActions = ['CUSTOM'];

        const expectedPrecedingSessions = mockSplitSessions.slice(
          mockCaseSubmitSessionIndex + 1,
          mockCaseSubmitSessionIndex + 3
        );
        const precedingSessions = buildPrecedingSessions(
          mockSplitSessions,
          mockCaseSubmitSessionIndex,
          mockExcludedCustomActions
        );

        expect(precedingSessions.length).toEqual(2);
        expect(precedingSessions).toEqual(expectedPrecedingSessions);

        precedingSessions.forEach((session, index) => {
          expect(session.start).toEqual(expectedPrecedingSessions[index].start);
          expect(session.end).toEqual(expectedPrecedingSessions[index].end);

          const actions = session.actions;
          expect(actions.length).toEqual(0);
          actions.forEach((action) => {
            expect(action.actionType).not.toEqual(mockExcludedCustomActions[0]);
          });
        });
      });
    });
  });

  describe('#buildFollowingSessions', () => {
    describe('when there are no custom actions to be excluded', () => {
      it('should return an array of two user sessions coming after the index of the current session', async () => {
        const mockCaseSubmitSessionIndex = 2;

        const expectedFollowingSessions = mockSplitSessions.slice(
          mockCaseSubmitSessionIndex - 2,
          mockCaseSubmitSessionIndex
        );
        const followingSessions = buildFollowingSessions(
          mockSplitSessions,
          mockCaseSubmitSessionIndex
        );

        expect(followingSessions.length).toEqual(2);
        expect(followingSessions).toEqual(expectedFollowingSessions);

        followingSessions.forEach((session, index) => {
          expect(session.start).toEqual(expectedFollowingSessions[index].start);
          expect(session.end).toEqual(expectedFollowingSessions[index].end);
        });
      });
    });
    describe('when there are custom actions to be excluded', () => {
      it('should return an array of two user sessions coming after the index of the current session with their actions filtered', async () => {
        const mockCaseSubmitSessionIndex = 2;
        const mockExcludedCustomActions = ['CUSTOM'];

        const expectedFollowingSessions = mockSplitSessions.slice(
          mockCaseSubmitSessionIndex - 2,
          mockCaseSubmitSessionIndex
        );
        const followingSessions = buildFollowingSessions(
          mockSplitSessions,
          mockCaseSubmitSessionIndex,
          mockExcludedCustomActions
        );

        expect(followingSessions.length).toEqual(2);
        expect(followingSessions).toEqual(expectedFollowingSessions);

        followingSessions.forEach((session, index) => {
          expect(session.start).toEqual(expectedFollowingSessions[index].start);
          expect(session.end).toEqual(expectedFollowingSessions[index].end);

          const actions = session.actions;
          expect(actions.length).toEqual(0);
          actions.forEach((action) => {
            expect(action.actionType).not.toEqual(mockExcludedCustomActions[0]);
          });
        });
      });
    });
  });

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
        caseSessionFound: true,
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
