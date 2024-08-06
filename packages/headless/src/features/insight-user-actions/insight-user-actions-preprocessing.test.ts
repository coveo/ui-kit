import {
  sortActions,
  filterActions,
  mapUserActions,
  isPartOfTheSameSession,
  splitActionsIntoTimelineSessions,
  insertTicketCreationActionInSession,
  filterTimelineActions,
  preprocessActionsData,
} from './insight-user-actions-preprocessing';
import {UserActionType} from './insight-user-actions-state';

const createRelativeDate = (date: Date, minutes: number, seconds: number) => {
  const totalSeconds = seconds + minutes * 60;
  const newDate = new Date(date);
  newDate.setSeconds(newDate.getSeconds() + totalSeconds);
  return newDate;
};

const firstSessionDate = new Date('03/29/2022 08:50:00 GMT');
const caseCreationDate = new Date('03/31/2022 16:30:00 GMT');
const secondSessionDate = new Date('04/01/2022 14:14:00 GMT');

const fakeActions = [
  {
    time: firstSessionDate.getTime(),
    name: 'Custom',
    value: {
      event_type: 'MySpeedbit App interfaceload',
      event_value: '',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(firstSessionDate, 1, 0).getTime(),
    name: 'Click',
    // Title : Getting Started with your New Speedbit Blaze
    value: {
      // eslint-disable-next-line @cspell/spellchecker
      uri_hash: 'ZKoJzryqñ9QlKPlh',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(firstSessionDate, 5, 0).getTime(),
    name: 'Search',
    value: {
      query_expression: 'Version 8.124',
      origin_level_1: 'community-search',
    },
  },
  {
    time: createRelativeDate(firstSessionDate, 32, 0).getTime(),
    name: 'Custom',
    value: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'expandSmartSnippetSuggestion',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(firstSessionDate, 34, 30).getTime(),
    name: 'Custom',
    value: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'likeSmartSnippet',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, -6, 0).getTime(),
    name: 'Custom',
    value: {
      event_type: 'MySpeedbit App interfaceload',
      event_value: '',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, -5, 0).getTime(),
    name: 'Search',
    value: {
      query_expression: 'Blaze pair with iPhone not working',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, 1, 30).getTime(),
    name: 'Custom',
    value: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'expandSmartSnippetSuggestion',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, 2, 0).getTime(),
    name: 'Click',
    // Title : Blaze pair with iPhone not working
    value: {
      uri_hash: 'caCgiG2JPzjZfS7G',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, 5, 0).getTime(),
    name: 'View',
    value: {
      content_id_key: 'sftitle',
      content_id_value: 'Blaze pair with iPhone not working',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, -1, 0).getTime(),
    name: 'Search',
    value: {
      query_expression: 'Wireless charging',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 1, 0).getTime(),
    name: 'Click',
    // Title : Getting Started with Speedbit Charge.pdf
    value: {
      uri_hash: 'KXñi9EWk38wnb1tt',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 3, 0).getTime(),
    name: 'Custom',
    value: {
      event_type: 'ticket_classification_click',
      event_value: '',
      origin_level_1: 'community-support',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 45, 0).getTime(),
    name: 'Click',
    // Title : Speedbit Charge 2 User Manual.pdf
    value: {
      uri_hash: 'TtnKwc0Lo2GY9WAi',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 60, 0).getTime(),
    name: 'View',
    value: {
      content_id_key: 'sftitle',
      content_id_value: 'Speedbit Charge 2 User Manual.pdf',
      origin_level_1: 'in-product-help',
    },
  },
].map((action) => {
  return {
    ...action,
    name: action.name.toUpperCase(),
    value: JSON.stringify(action.value),
    time: JSON.stringify(action.time),
  };
});

const expectedTimeline = {
  precedingSessions: [
    {
      start: '1648544100000',
      end: '1648545870000',
      actions: [
        {
          actionType: 'SEARCH',
          timestamp: '1648544100000',
          eventData: {},
          searchHub: 'community-search',
          document: {},
          query: 'Version 8.124',
        },
      ],
    },
  ],
  session: {
    start: '1648743840000',
    end: '1648744500000',
    actions: [
      {
        actionType: 'VIEW',
        timestamp: '1648744500000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {},
      },
      {
        actionType: 'CLICK',
        timestamp: '1648744320000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {
          uriHash: 'caCgiG2JPzjZfS7G',
        },
      },
      {
        actionType: 'TICKET_CREATION',
        timestamp: '1648744200000',
      },
      {
        actionType: 'SEARCH',
        timestamp: '1648743900000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {},
        query: 'Blaze pair with iPhone not working',
      },
    ],
  },
  followingSessions: [
    {
      start: '1648825140000',
      end: '1648826040000',
      actions: [
        {
          actionType: 'VIEW',
          timestamp: '1648826040000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'CLICK',
          timestamp: '1648825140000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            uriHash: 'TtnKwc0Lo2GY9WAi',
          },
        },
      ],
    },
    {
      start: '1648822380000',
      end: '1648822620000',
      actions: [
        {
          actionType: 'CLICK',
          timestamp: '1648822500000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            uriHash: 'KXñi9EWk38wnb1tt',
          },
        },
        {
          actionType: 'SEARCH',
          timestamp: '1648822380000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
          query: 'Wireless charging',
        },
      ],
    },
  ],
  caseSessionFound: true,
};

describe('insight user actions preprocessing', () => {
  describe('#sortActions', () => {
    it('should properly sort the raw user actions by most recent to least recent', async () => {
      const mockActions = [...fakeActions];
      const expectedSortedRawUserActions = mockActions.reverse();

      const sortedRawActions = sortActions(mockActions);

      expect(sortedRawActions).toEqual(expectedSortedRawUserActions);
    });
  });

  describe('#mapUserActions', () => {
    it('should properly map the raw user actions into UserAction objects', async () => {
      const expectedMappedActions = [
        {
          actionType: 'VIEW',
          timestamp: '1648826040000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'CLICK',
          timestamp: '1648825140000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {uriHash: 'TtnKwc0Lo2GY9WAi'},
        },
        {
          actionType: 'CUSTOM',
          timestamp: '1648822620000',
          eventData: {type: 'ticket_classification_click', value: ''},
          searchHub: 'community-support',
          document: {},
        },
        {
          actionType: 'CLICK',
          timestamp: '1648822500000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {uriHash: 'KXñi9EWk38wnb1tt'},
        },
        {
          actionType: 'SEARCH',
          timestamp: '1648822380000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
          query: 'Wireless charging',
        },
        {
          actionType: 'VIEW',
          timestamp: '1648744500000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'CLICK',
          timestamp: '1648744320000',
          eventData: {},
          searchHub: 'in-product-help',
          document: {uriHash: 'caCgiG2JPzjZfS7G'},
        },
        {
          actionType: 'CUSTOM',
          timestamp: '1648744290000',
          eventData: {
            type: 'smartSnippetSuggestions',
            value: 'expandSmartSnippetSuggestion',
          },
          searchHub: 'in-product-help',
          document: {},
        },
      ];
      const mockSortedActions = sortActions([...fakeActions]);

      const mappedAction = mapUserActions(mockSortedActions.slice(0, 8));

      expect(mappedAction).toEqual(expectedMappedActions);
    });
  });

  describe('#filterAction', () => {
    const mockSortedActions = sortActions([...fakeActions]);
    const mockMappedActions = mapUserActions(mockSortedActions.slice(0, 8));
    const expectedFilteredActions = [
      {
        actionType: 'VIEW',
        timestamp: '1648826040000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {},
      },
      {
        actionType: 'CLICK',
        timestamp: '1648825140000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {uriHash: 'TtnKwc0Lo2GY9WAi'},
      },
      {
        actionType: 'CLICK',
        timestamp: '1648822500000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {uriHash: 'KXñi9EWk38wnb1tt'},
      },
      {
        actionType: 'SEARCH',
        timestamp: '1648822380000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {},
        query: 'Wireless charging',
      },
      {
        actionType: 'VIEW',
        timestamp: '1648744500000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {},
      },
      {
        actionType: 'CLICK',
        timestamp: '1648744320000',
        eventData: {},
        searchHub: 'in-product-help',
        document: {uriHash: 'caCgiG2JPzjZfS7G'},
      },
    ];
    it('should properly filter the user actions when action types are passed in the state', async () => {
      const mockExcludedCustomActions = ['CUSTOM'];

      const filteredActions = filterActions(
        mockMappedActions,
        mockExcludedCustomActions
      );

      expect(filteredActions).toEqual(expectedFilteredActions);
      expect(filteredActions.length).toEqual(expectedFilteredActions.length);
    });

    it('should properly filter the user actions when event data types and values are passed in the state', async () => {
      const mockExcludedCustomActions = ['suggestion_click'];

      const filteredActions = filterActions(
        mockMappedActions,
        mockExcludedCustomActions
      );

      expect(filteredActions).toEqual(expectedFilteredActions);
      expect(filteredActions.length).toEqual(expectedFilteredActions.length);
    });
  });

  describe('#splitActionsIntoTimelineSessions', () => {
    describe('when it finds a case creation session', () => {
      it('should properly split user actions into sessions and return the timeline including current session', async () => {
        const mockSortedActions = sortActions([...fakeActions]);
        const mockMappedActions = mapUserActions(mockSortedActions);
        const ticketCreationDate = JSON.stringify(caseCreationDate.getTime());

        const sessions = splitActionsIntoTimelineSessions(
          mockMappedActions,
          ticketCreationDate
        );

        expect(sessions.session?.actions.length).toEqual(6);
        expect(Number(sessions.session?.start)).toBeGreaterThan(
          Number(
            sessions.precedingSessions[sessions.precedingSessions.length - 1]
              .end
          )
        );
        expect(Number(sessions.session?.end)).toBeLessThan(
          Number(sessions.followingSessions[0].start)
        );

        expect(sessions.precedingSessions.length).toEqual(1);
        expect(sessions.precedingSessions[0].actions.length).toEqual(3);

        expect(sessions.followingSessions.length).toEqual(2);
        expect(sessions.followingSessions[0].actions.length).toEqual(2);
      });
    });

    describe('when it does not find a case creation session', () => {
      describe('when the ticket creation date comes before all the sessions', () => {
        it('should properly split user actions into sessions and return the timeline including current session timestamp set as the ticket creation date', async () => {
          const mockSortedActions = sortActions([...fakeActions]);
          const mockMappedActions = mapUserActions(mockSortedActions);
          // Date far back before the first session
          const ticketCreationDate = JSON.stringify(
            createRelativeDate(firstSessionDate, -1000, 0).getTime()
          );

          const sessions = splitActionsIntoTimelineSessions(
            mockMappedActions,
            ticketCreationDate
          );

          expect(sessions.session?.actions.length).toEqual(1);
          expect(sessions.session?.actions[0].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
          expect(sessions.session?.actions[0].timestamp).toEqual(
            ticketCreationDate
          );
          expect(sessions).toEqual(sessions);
        });
      });

      describe('when the ticket creation date falls between two sessions', () => {
        it('should properly split user actions into sessions and return the timeline including current session timestamp set as the ticket creation date', async () => {
          const mockSortedActions = sortActions([...fakeActions]);
          const mockMappedActions = mapUserActions(mockSortedActions);
          const ticketCreationDate = JSON.stringify(
            createRelativeDate(caseCreationDate, 120, 0).getTime()
          );

          const sessions = splitActionsIntoTimelineSessions(
            mockMappedActions,
            ticketCreationDate
          );

          expect(sessions.session?.actions.length).toEqual(1);
          expect(sessions.session?.actions[0].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
          expect(sessions.session?.actions[0].timestamp).toEqual(
            ticketCreationDate
          );
          expect(sessions).toEqual(sessions);
        });
      });
    });
  });

  describe('#isPartOfTheSameSession', () => {
    it('should return true if the action is within 30mins of the previous', async () => {
      const action = {
        actionType: 'CLICK' as UserActionType,
        timestamp: firstSessionDate.getTime().toString(),
        eventData: {},
        searchHub: 'in-product-help',
        document: {uriHash: 'TtnKwc0Lo2GY9WAi'},
      };

      // Added 1 min to action timestamp, so it is within 30 mins of the previous action
      const previousEndDateTime = JSON.stringify(
        createRelativeDate(firstSessionDate, 1, 0).getTime()
      );

      const isSameSession = isPartOfTheSameSession(action, previousEndDateTime);
      expect(isSameSession).toEqual(true);
    });

    it('should return false if the action is not within 30mins of the previous', async () => {
      const action = {
        actionType: 'CLICK' as UserActionType,
        timestamp: firstSessionDate.getTime().toString(),
        eventData: {},
        searchHub: 'in-product-help',
        document: {uriHash: 'TtnKwc0Lo2GY9WAi'},
      };

      // Added 1 hour to action timestamp, so it is not within 30 mins of the previous action
      const previousEndDateTime = JSON.stringify(
        createRelativeDate(firstSessionDate, 60, 0).getTime()
      );

      const isSameSession = isPartOfTheSameSession(action, previousEndDateTime);
      expect(isSameSession).toEqual(false);
    });
  });

  describe('#insertTicketCreationActionInSession', () => {
    it('should return an array with only the ticket creation action when the current session is undefined', async () => {
      const mockCurrentSession = undefined;
      const mockTicketCreationDate = JSON.stringify(caseCreationDate.getTime());

      const caseCreationSessionActions = insertTicketCreationActionInSession(
        mockCurrentSession,
        mockTicketCreationDate
      );

      expect(caseCreationSessionActions.length).toEqual(1);
      expect(caseCreationSessionActions[0].actionType).toEqual(
        UserActionType.TICKET_CREATION
      );
    });

    it('should properly insert the ticket creation action in the current session at its correct position', async () => {
      const mockCurrentSession = {
        start: JSON.stringify(
          createRelativeDate(caseCreationDate, -6, 0).getTime()
        ),
        end: JSON.stringify(
          createRelativeDate(caseCreationDate, 5, 0).getTime()
        ),
        actions: [
          {
            actionType: 'VIEW' as UserActionType,
            timestamp: '1648744500000',
            eventData: {},
            searchHub: 'in-product-help',
            document: {},
          },
          {
            actionType: 'CLICK' as UserActionType,
            timestamp: '1648744320000',
            eventData: {},
            searchHub: 'in-product-help',
            document: {
              uriHash: 'caCgiG2JPzjZfS7G',
            },
          },
          {
            actionType: 'CUSTOM' as UserActionType,
            timestamp: '1648744290000',
            eventData: {
              type: 'smartSnippetSuggestions',
              value: 'expandSmartSnippetSuggestion',
            },
            searchHub: 'in-product-help',
            document: {},
          },
          {
            actionType: 'SEARCH' as UserActionType,
            timestamp: '1648743900000',
            eventData: {},
            searchHub: 'in-product-help',
            document: {},
            query: 'Blaze pair with iPhone not working',
          },
          {
            actionType: 'CUSTOM' as UserActionType,
            timestamp: '1648743840000',
            eventData: {
              type: 'MySpeedbit App interfaceload',
              value: '',
            },
            searchHub: 'in-product-help',
            document: {},
          },
        ],
      };
      const mockTicketCreationDate = JSON.stringify(caseCreationDate.getTime());

      const caseCreationSessionActions = insertTicketCreationActionInSession(
        mockCurrentSession,
        mockTicketCreationDate
      );

      expect(caseCreationSessionActions.length).toEqual(6);
      expect(caseCreationSessionActions[3].actionType).toEqual(
        UserActionType.TICKET_CREATION
      );
    });
  });

  describe('#filterTimelineActions', () => {
    it('should properly filter out the timeline of the actions that are to be excluded', async () => {
      const actionsToExclude = ['CUSTOM'];
      const mockSortedActions = sortActions([...fakeActions]);
      const mockMappedActions = mapUserActions(mockSortedActions);
      const ticketCreationDate = JSON.stringify(caseCreationDate.getTime());
      const sessionsTimeline = splitActionsIntoTimelineSessions(
        mockMappedActions,
        ticketCreationDate
      );

      const filteredTimeline = filterTimelineActions(
        sessionsTimeline,
        actionsToExclude
      );

      // Checks that no sessions in each section of the timeline contains any of the actions to exclude
      actionsToExclude.forEach((actionType) => {
        filteredTimeline.precedingSessions.forEach((session) => {
          expect(
            session.actions.every((action) => action.actionType !== actionType)
          ).toEqual(true);
        });

        filteredTimeline.followingSessions.forEach((session) => {
          expect(
            session.actions.every((action) => action.actionType !== actionType)
          ).toEqual(true);
        });

        expect(
          filteredTimeline.session?.actions.every(
            (action) => action.actionType !== actionType
          )
        ).toEqual(true);
      });
    });
  });

  describe('#preprocessActionsData', () => {
    describe('when ticket creation date is not provided', () => {
      it('should return an empty timeline', async () => {
        const expectedTimeline = {
          precedingSessions: [],
          session: undefined,
          followingSessions: [],
          caseSessionFound: false,
        };
        const mockState = {
          excludedCustomActions: ['CUSTOM'],
          ticketCreationDate: undefined,
          loading: false,
        };

        const timeline = preprocessActionsData(mockState, fakeActions);

        expect(timeline).toEqual(expectedTimeline);
      });
    });

    describe('when the case submit session is found', () => {
      it('should return a timeline with the case creation session', () => {
        const ticketCreationDate = JSON.stringify(caseCreationDate.getTime());
        const mockState = {
          excludedCustomActions: ['CUSTOM'],
          ticketCreationDate: ticketCreationDate,
          loading: false,
        };
        const preprocessedTimeline = preprocessActionsData(
          mockState,
          fakeActions
        );

        expect(preprocessedTimeline).toEqual(expectedTimeline);
        expect(preprocessedTimeline.caseSessionFound).toEqual(true);
        expect(preprocessedTimeline.precedingSessions.length).toEqual(
          expectedTimeline.precedingSessions.length
        );
        expect(preprocessedTimeline.followingSessions.length).toEqual(
          expectedTimeline.followingSessions.length
        );
        expect(preprocessedTimeline.session?.actions.length).toEqual(
          expectedTimeline.session?.actions.length
        );
      });

      describe('when the case submit session is not found', () => {
        it('should return a timeline with the current session containing only a ticket creation action', () => {
          const ticketCreationDate = JSON.stringify(
            createRelativeDate(caseCreationDate, 120, 0).getTime()
          );
          const mockState = {
            excludedCustomActions: ['CUSTOM'],
            ticketCreationDate: ticketCreationDate,
            loading: false,
          };

          const preprocessedTimeline = preprocessActionsData(
            mockState,
            fakeActions
          );

          expect(preprocessedTimeline.caseSessionFound).toEqual(false);
          expect(preprocessedTimeline.session?.actions.length).toEqual(1);
          expect(preprocessedTimeline.session?.actions[0].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
          expect(preprocessedTimeline.session?.actions[0].timestamp).toEqual(
            ticketCreationDate
          );
        });
      });
    });
  });
});
