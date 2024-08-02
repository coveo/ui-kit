/* eslint-disable @cspell/spellchecker */
import {
  sortActions,
  filterActions,
  mapUserActions,
  splitActionsIntoTimelineSessions,
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
    T: firstSessionDate.getTime(),
    N: 'Custom',
    V: {
      event_type: 'MySpeedbit App interfaceload',
      event_value: '',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(firstSessionDate, 1, 0).getTime(),
    N: 'Click',
    // Title : Getting Started with your New Speedbit Blaze
    V: {
      uri_hash: 'ZKoJzryqñ9QlKPlh',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(firstSessionDate, 5, 0).getTime(),
    N: 'Search',
    V: {
      query_expression: 'Version 8.124',
      origin_level_1: 'community-search',
    },
  },
  {
    T: createRelativeDate(firstSessionDate, 32, 0).getTime(),
    N: 'Custom',
    V: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'expandSmartSnippetSuggestion',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(firstSessionDate, 34, 30).getTime(),
    N: 'Custom',
    V: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'likeSmartSnippet',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(caseCreationDate, -6, 0).getTime(),
    N: 'Custom',
    V: {
      event_type: 'MySpeedbit App interfaceload',
      event_value: '',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(caseCreationDate, -5, 0).getTime(),
    N: 'Search',
    V: {
      query_expression: 'Blaze pair with iPhone not working',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(caseCreationDate, 1, 30).getTime(),
    N: 'Custom',
    V: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'expandSmartSnippetSuggestion',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(caseCreationDate, 2, 0).getTime(),
    N: 'Click',
    // Title : Blaze pair with iPhone not working
    V: {
      uri_hash: 'caCgiG2JPzjZfS7G',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(caseCreationDate, 5, 0).getTime(),
    N: 'View',
    V: {
      content_id_key: 'sftitle',
      content_id_value: 'Blaze pair with iPhone not working',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(secondSessionDate, -1, 0).getTime(),
    N: 'Search',
    V: {
      query_expression: 'Wireless charging',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(secondSessionDate, 1, 0).getTime(),
    N: 'Click',
    // Title : Getting Started with Speedbit Charge.pdf
    V: {
      uri_hash: 'KXñi9EWk38wnb1tt',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(secondSessionDate, 3, 0).getTime(),
    N: 'Custom',
    V: {
      event_type: 'ticket_classification_click',
      event_value: '',
      origin_level_1: 'community-support',
    },
  },
  {
    T: createRelativeDate(secondSessionDate, 45, 0).getTime(),
    N: 'Click',
    // Title : Speedbit Charge 2 User Manual.pdf
    V: {
      uri_hash: 'TtnKwc0Lo2GY9WAi',
      origin_level_1: 'in-product-help',
    },
  },
  {
    T: createRelativeDate(secondSessionDate, 60, 0).getTime(),
    N: 'View',
    V: {
      content_id_key: 'sftitle',
      content_id_value: 'Speedbit Charge 2 User Manual.pdf',
      origin_level_1: 'in-product-help',
    },
  },
].map((action) => {
  return {
    ...action,
    name: action.N.toUpperCase(),
    value: JSON.stringify(action.V),
    time: JSON.stringify(action.T),
  };
});

describe('insight user actions preprocessing', () => {
  describe('#sortActions', () => {
    it('should properly sort the raw user actions by most recent to least recent', async () => {
      const mockActions = [...fakeActions];
      const sortedRawActions = sortActions(mockActions);
      const expectedSortedRawUserActions = mockActions.reverse();
      expect(sortedRawActions).toEqual(expectedSortedRawUserActions);
    });
  });

  describe('#mapUserActions', () => {
    it('should properly map the raw user actions into UserAction objects', async () => {
      const mockSortedActions = sortActions([...fakeActions]);
      const mappedAction = mapUserActions(mockSortedActions.slice(0, 8));
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

  // eslint-disable-next-line no-restricted-properties
  describe.skip('#splitActionsIntoTimelineSessions', () => {
    describe('when it finds a case creation session', () => {
      it('should properly split user actions into sessions and return the timeline including current session', async () => {
        const mockSortedActions = sortActions([...fakeActions]);
        const mockMappedActions = mapUserActions(mockSortedActions);
        const ticketCreationDate = JSON.stringify(caseCreationDate.getTime());
        const sessions = splitActionsIntoTimelineSessions(
          mockMappedActions,
          ticketCreationDate
        );
        console.log(JSON.stringify(sessions));
        expect(sessions.session?.actions.length).toEqual(5);
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
    // eslint-disable-next-line no-restricted-properties
    describe.only('when it does not find a case creation session', () => {
      it('should properly split user actions into sessions and return the timeline including current session', async () => {
        const mockSortedActions = sortActions([...fakeActions]);
        const mockMappedActions = mapUserActions(mockSortedActions);
        // Date far back before the first session
        const ticketCreationDate = JSON.stringify(
          createRelativeDate(firstSessionDate, -1000, 0).getTime()
        );
        console.log('ticketCreationDate: ' + ticketCreationDate);
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
        console.log(JSON.stringify(sessions));
        expect(sessions).toEqual(sessions);
      });
    });
  });

  // describe('#isPartOfTheSameSession', () => {
  //   it('should return true if the action is within 30mins of the previous', async () => {
  //     const action = mockMappedActions[0];
  //     // Added 1 min to action timestamp, so it is within 30 mins of the previous action
  //     const previousEndDateTime = JSON.stringify(
  //       createRelativeDate(firstSessionDate, 1, 0).getTime()
  //     );

  //     const isSameSession = isPartOfTheSameSession(action, previousEndDateTime);

  //     expect(isSameSession).toEqual(true);
  //   });

  //   it('should return false if the action is not within 30mins of the previous', async () => {
  //     const action = mockMappedActions[0];
  //     // Added 1 hour to action timestamp, so it is not within 30 mins of the previous action
  //     const previousEndDateTime = '1719590400000';

  //     const isSameSession = isPartOfTheSameSession(action, previousEndDateTime);

  //     expect(isSameSession).toEqual(false);
  //   });
  // });

  describe('#filterTimelineActions', () => {
    it('should properly filter out the timeline of the actions that are to be excluded', async () => {
      // TODO
    });
  });

  // eslint-disable-next-line no-restricted-properties
  describe.skip('#preprocessActionsData', () => {
    describe('when ticket creation date is not provided', () => {
      it('should return an empty timeline', async () => {
        // const expectedTimeline = {
        //   precedingSessions: [],
        //   session: undefined,
        //   followingSessions: [],
        //   caseSessionFound: false,
        // };
        // const mockState = {
        //   excludedCustomActions: ['CUSTOM'],
        //   ticketCreationDate: undefined,
        //   loading: false,
        // };
        // const timeline = preprocessActionsData(mockState, mockRawUserActions);
        // expect(timeline).toEqual(expectedTimeline);
      });
    });

    describe.skip('when the case submit session is found', () => {
      it('should return a timeline with the case creation session', () => {
        // const ticketCreationDate = '1719586800000';
        // const mockState = {
        //   excludedCustomActions: ['CUSTOM'],
        //   ticketCreationDate: ticketCreationDate,
        //   loading: false,
        // };
        // const result = preprocessActionsData(
        //   mockState,
        //   mockRawUserActionsForFinalTest
        // );
        // console.log('RESULT: ' + JSON.stringify(result));
        // expect(result).toEqual({});
      });

      describe('when the case submit session is not found', () => {
        it('should return a timeline with the current session containing only a ticket creation action', () => {
          // const ticketCreationDate = '1719586800000';
          // const mockState = {
          //   excludedCustomActions: ['CUSTOM'],
          //   ticketCreationDate: ticketCreationDate,
          //   loading: false,
          // };
          // const result = preprocessActionsData(
          //   mockState,
          //   mockRawUserActionsForFinalTest
          // );
          // console.log('RESULT: ' + JSON.stringify(result));
          // expect(result).toEqual({});
        });
      });
    });
  });
});
