import {
  mapAndSortActionsByMostRecent,
  isActionWithinSessionThreshold,
  preprocessActionsData,
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

const actionsToExclude = ['useless_event'];

const fakeActions = [
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
    value: {
      title: 'title',
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
      query_expression: '',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 1, 0).getTime(),
    name: 'Click',
    value: {
      title: 'title',
      uri_hash: 'KXñi9EWk38wnb1tt',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 3, 0).getTime(),
    name: 'Custom',
    value: {
      event_type: 'useless_event',
      event_value: '',
      origin_level_1: 'community-support',
    },
  },
  {
    time: createRelativeDate(secondSessionDate, 45, 0).getTime(),
    name: 'Click',
    value: {
      title: 'title',
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
    value: {
      title: 'title',
      uri_hash: 'someHash',
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
      start: 1648544100000,
      end: 1648545870000,
      actions: [
        {
          actionType: 'CUSTOM',
          timestamp: 1648545870000,
          eventData: {
            type: 'smartSnippetSuggestions',
            value: 'likeSmartSnippet',
          },
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'CUSTOM',
          timestamp: 1648545720000,
          eventData: {
            type: 'smartSnippetSuggestions',
            value: 'expandSmartSnippetSuggestion',
          },
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'SEARCH',
          timestamp: 1648544100000,
          eventData: {},
          searchHub: 'community-search',
          document: {},
          query: 'Version 8.124',
        },
      ],
    },
    {
      start: 1648543800000,
      end: 1648543860000,
      actions: [
        {
          actionType: 'CLICK',
          timestamp: 1648543860000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'someHash',
          },
        },
        {
          actionType: 'CUSTOM',
          timestamp: 1648543800000,
          eventData: {
            type: 'MySpeedbit App interfaceload',
            value: '',
          },
          searchHub: 'in-product-help',
          document: {},
        },
      ],
    },
  ],
  session: {
    start: 1648743840000,
    end: 1648744500000,
    actions: [
      {
        actionType: 'VIEW',
        timestamp: 1648744500000,
        eventData: {},
        searchHub: 'in-product-help',
        document: {
          contentIdKey: 'sftitle',
          contentIdValue: 'Blaze pair with iPhone not working',
        },
      },
      {
        actionType: 'CLICK',
        timestamp: 1648744320000,
        eventData: {},
        searchHub: 'in-product-help',
        document: {
          title: 'title',
          uriHash: 'caCgiG2JPzjZfS7G',
        },
      },
      {
        actionType: 'CUSTOM',
        timestamp: 1648744290000,
        eventData: {
          type: 'smartSnippetSuggestions',
          value: 'expandSmartSnippetSuggestion',
        },
        searchHub: 'in-product-help',
        document: {},
      },
      {
        actionType: 'TICKET_CREATION',
        timestamp: 1648744200000,
        eventData: {},
      },
      {
        actionType: 'SEARCH',
        timestamp: 1648743900000,
        eventData: {},
        searchHub: 'in-product-help',
        document: {},
        query: 'Blaze pair with iPhone not working',
      },
      {
        actionType: 'CUSTOM',
        timestamp: 1648743840000,
        eventData: {
          type: 'MySpeedbit App interfaceload',
          value: '',
        },
        searchHub: 'in-product-help',
        document: {},
      },
    ],
  },
  followingSessions: [
    {
      start: 1648825140000,
      end: 1648826040000,
      actions: [
        {
          actionType: 'VIEW',
          timestamp: 1648826040000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            contentIdKey: 'sftitle',
            contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
          },
        },
        {
          actionType: 'CLICK',
          timestamp: 1648825140000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'TtnKwc0Lo2GY9WAi',
          },
        },
      ],
    },
    {
      start: 1648822380000,
      end: 1648822620000,
      actions: [
        {
          actionType: 'CLICK',
          timestamp: 1648822500000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'KXñi9EWk38wnb1tt',
          },
        },
      ],
    },
  ],
};

describe('insight user actions preprocessing', () => {
  describe('#mapAndSortActionsByMostRecent', () => {
    it('should properly map and sort the raw user actions into UserAction objects', async () => {
      const expectedMappedAndSortedActions = [
        {
          actionType: 'VIEW',
          timestamp: 1648826040000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            contentIdKey: 'sftitle',
            contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
          },
        },
        {
          actionType: 'CLICK',
          timestamp: 1648825140000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {title: 'title', uriHash: 'TtnKwc0Lo2GY9WAi'},
        },
        {
          actionType: 'CUSTOM',
          timestamp: 1648822620000,
          eventData: {type: 'useless_event', value: ''},
          searchHub: 'community-support',
          document: {},
        },
        {
          actionType: 'CLICK',
          timestamp: 1648822500000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {title: 'title', uriHash: 'KXñi9EWk38wnb1tt'},
        },
        {
          actionType: 'SEARCH',
          timestamp: 1648822380000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
          query: '',
        },
        {
          actionType: 'VIEW',
          timestamp: 1648744500000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            contentIdKey: 'sftitle',
            contentIdValue: 'Blaze pair with iPhone not working',
          },
        },
        {
          actionType: 'CLICK',
          timestamp: 1648744320000,
          eventData: {},
          searchHub: 'in-product-help',
          document: {title: 'title', uriHash: 'caCgiG2JPzjZfS7G'},
        },
        {
          actionType: 'CUSTOM',
          timestamp: 1648744290000,
          eventData: {
            type: 'smartSnippetSuggestions',
            value: 'expandSmartSnippetSuggestion',
          },
          searchHub: 'in-product-help',
          document: {},
        },
      ];
      const mockRawActions = [...fakeActions].slice(0, 8);
      const mappedAndSortedActions =
        mapAndSortActionsByMostRecent(mockRawActions);

      expect(mappedAndSortedActions).toEqual(expectedMappedAndSortedActions);
      expect(mappedAndSortedActions[0].timestamp).toBeGreaterThan(
        mappedAndSortedActions[1].timestamp
      );
    });

    describe('when a rawUserAction cannot be parsed', () => {
      let consoleWarnSpy: jest.SpyInstance;

      beforeAll(() => {
        consoleWarnSpy = jest
          .spyOn(console, 'warn')
          .mockImplementation(
            () =>
              'Some user actions could not be parsed. Please check the raw user actions data.'
          );
      });

      afterAll(() => {
        consoleWarnSpy.mockRestore();
      });

      it('should log a warning in the console and ignore that value', () => {
        const invalidRawUserAction = {
          name: 'Custom',
          value: '{ "key": "value",,,, }',
          time: '2023-10-01T12:00:00Z',
        };

        const mappedAndSortedActions = mapAndSortActionsByMostRecent([
          invalidRawUserAction,
        ]);

        expect(mappedAndSortedActions.length).toEqual(0);
        expect(mappedAndSortedActions).toEqual([]);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Some user actions could not be parsed. Please check the raw user actions data.'
        );
      });
    });
  });

  describe('#splitActionsIntoTimelineSessions', () => {
    describe('when it finds a case creation session', () => {
      describe('when the ticket creation date is within a session', () => {
        it('should properly split user actions into sessions and return the timeline including current session', async () => {
          const mockRawActions = [...fakeActions];
          const expectedTimeline = {
            precedingSessions: [
              {
                start: 1648544100000,
                end: 1648545870000,
                actions: [
                  {
                    actionType: 'CUSTOM',
                    timestamp: 1648545870000,
                    eventData: {
                      type: 'smartSnippetSuggestions',
                      value: 'likeSmartSnippet',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                  {
                    actionType: 'CUSTOM',
                    timestamp: 1648545720000,
                    eventData: {
                      type: 'smartSnippetSuggestions',
                      value: 'expandSmartSnippetSuggestion',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                  {
                    actionType: 'SEARCH',
                    timestamp: 1648544100000,
                    eventData: {},
                    searchHub: 'community-search',
                    document: {},
                    query: 'Version 8.124',
                  },
                ],
              },
              {
                start: 1648543800000,
                end: 1648543860000,
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: 1648543860000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'someHash',
                    },
                  },
                  {
                    actionType: 'CUSTOM',
                    timestamp: 1648543800000,
                    eventData: {
                      type: 'MySpeedbit App interfaceload',
                      value: '',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                ],
              },
            ],
            session: {
              start: 1648743840000,
              end: 1648744500000,
              actions: [
                {
                  actionType: 'VIEW',
                  timestamp: 1648744500000,
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    contentIdKey: 'sftitle',
                    contentIdValue: 'Blaze pair with iPhone not working',
                  },
                },
                {
                  actionType: 'CLICK',
                  timestamp: 1648744320000,
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    title: 'title',
                    uriHash: 'caCgiG2JPzjZfS7G',
                  },
                },
                {
                  actionType: 'CUSTOM',
                  timestamp: 1648744290000,
                  eventData: {
                    type: 'smartSnippetSuggestions',
                    value: 'expandSmartSnippetSuggestion',
                  },
                  searchHub: 'in-product-help',
                  document: {},
                },
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: 1648744200000,
                  eventData: {},
                },
                {
                  actionType: 'SEARCH',
                  timestamp: 1648743900000,
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {},
                  query: 'Blaze pair with iPhone not working',
                },
                {
                  actionType: 'CUSTOM',
                  timestamp: 1648743840000,
                  eventData: {
                    type: 'MySpeedbit App interfaceload',
                    value: '',
                  },
                  searchHub: 'in-product-help',
                  document: {},
                },
              ],
            },
            followingSessions: [
              {
                start: 1648825140000,
                end: 1648826040000,
                actions: [
                  {
                    actionType: 'VIEW',
                    timestamp: 1648826040000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      contentIdKey: 'sftitle',
                      contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
                    },
                  },
                  {
                    actionType: 'CLICK',
                    timestamp: 1648825140000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'TtnKwc0Lo2GY9WAi',
                    },
                  },
                ],
              },
              {
                start: 1648822380000,
                end: 1648822620000,
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: 1648822500000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'KXñi9EWk38wnb1tt',
                    },
                  },
                ],
              },
            ],
          };

          const mappedAndSortedActions =
            mapAndSortActionsByMostRecent(mockRawActions);
          const ticketCreationDate = caseCreationDate.getTime();

          const timeline = splitActionsIntoTimelineSessions(
            mappedAndSortedActions,
            ticketCreationDate,
            actionsToExclude
          );

          expect(timeline).toEqual(expectedTimeline);
        });
      });

      describe('when the ticket creation date is within the inactivity threshold after the end of a session', () => {
        it('should properly split user actions into sessions and return the timeline including current session', async () => {
          const ticketCreationDate = createRelativeDate(
            caseCreationDate,
            0,
            0
          ).getTime();
          const mockRawActions = [
            {
              time: createRelativeDate(firstSessionDate, 35, 30).getTime(),
              name: 'Custom',
              value: {
                event_type: 'smartSnippetSuggestions',
                event_value: 'expandSmartSnippetSuggestion',
                origin_level_1: 'in-product-help',
              },
            },
            {
              time: createRelativeDate(firstSessionDate, 45, 0).getTime(),
              name: 'Click',
              value: {
                title: 'title',
                uri_hash: 'caCgiG2JPzjZfS7G',
                origin_level_1: 'in-product-help',
              },
            },
            {
              time: createRelativeDate(caseCreationDate, -40, 0).getTime(),
              name: 'View',
              value: {
                content_id_key: 'sftitle',
                content_id_value: 'Blaze pair with iPhone not working',
                origin_level_1: 'in-product-help',
              },
            },
            {
              time: createRelativeDate(caseCreationDate, -15, 0).getTime(),
              name: 'Search',
              value: {
                query_expression: '',
                origin_level_1: 'in-product-help',
              },
            },
            {
              time: createRelativeDate(secondSessionDate, 1, 0).getTime(),
              name: 'Click',
              value: {
                title: 'title',
                uri_hash: 'KXñi9EWk38wnb1tt',
                origin_level_1: 'in-product-help',
              },
            },
            {
              time: createRelativeDate(secondSessionDate, 3, 0).getTime(),
              name: 'Custom',
              value: {
                event_type: 'useless_event',
                event_value: '',
                origin_level_1: 'community-support',
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
                start: 1648545930000,
                end: 1648546500000,
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: 1648546500000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'caCgiG2JPzjZfS7G',
                    },
                  },
                  {
                    actionType: 'CUSTOM',
                    timestamp: 1648545930000,
                    eventData: {
                      type: 'smartSnippetSuggestions',
                      value: 'expandSmartSnippetSuggestion',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                ],
              },
            ],
            session: {
              start: 1648741800000,
              end: 1648743300000,
              actions: [
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: 1648744200000,
                  eventData: {},
                },
                {
                  actionType: 'VIEW',
                  timestamp: 1648741800000,
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    contentIdKey: 'sftitle',
                    contentIdValue: 'Blaze pair with iPhone not working',
                  },
                },
              ],
            },
            followingSessions: [
              {
                start: 1648822500000,
                end: 1648822620000,
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: 1648822500000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'KXñi9EWk38wnb1tt',
                    },
                  },
                ],
              },
            ],
          };

          const mappedAndSortedActions =
            mapAndSortActionsByMostRecent(mockRawActions);

          const timeline = splitActionsIntoTimelineSessions(
            mappedAndSortedActions,
            ticketCreationDate,
            actionsToExclude
          );

          expect(timeline).toEqual(expectedTimeline);
        });
      });
    });

    describe('when it does not find a case creation session', () => {
      describe('when the ticket creation date comes before all the sessions', () => {
        it('should return the timeline with the ticket creation date set as the current session timestamp and following sessions', async () => {
          const mockRawActions = [...fakeActions].slice(0, 8);
          const expectedTimeline = {
            precedingSessions: [],
            session: {
              start: 1648483800000,
              end: 1648483800000,
              actions: [
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: 1648483800000,
                  eventData: {},
                },
              ],
            },
            followingSessions: [
              {
                start: 1648822380000,
                end: 1648822620000,
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: 1648822500000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'KXñi9EWk38wnb1tt',
                    },
                  },
                ],
              },
              {
                start: 1648744290000,
                end: 1648744500000,
                actions: [
                  {
                    actionType: 'VIEW',
                    timestamp: 1648744500000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      contentIdKey: 'sftitle',
                      contentIdValue: 'Blaze pair with iPhone not working',
                    },
                  },
                  {
                    actionType: 'CLICK',
                    timestamp: 1648744320000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'caCgiG2JPzjZfS7G',
                    },
                  },
                  {
                    actionType: 'CUSTOM',
                    timestamp: 1648744290000,
                    eventData: {
                      type: 'smartSnippetSuggestions',
                      value: 'expandSmartSnippetSuggestion',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                ],
              },
            ],
          };
          const mappedAndSortedActions =
            mapAndSortActionsByMostRecent(mockRawActions);
          // Date far back before the first session
          const ticketCreationDate = createRelativeDate(
            firstSessionDate,
            -1000,
            0
          ).getTime();

          const timeline = splitActionsIntoTimelineSessions(
            mappedAndSortedActions,
            ticketCreationDate,
            actionsToExclude
          );
          expect(timeline).toEqual(expectedTimeline);
        });
      });

      describe('when the ticket creation date comes after all the sessions', () => {
        it('should return the timeline with the ticket creation date set as the current session timestamp and preceding sessions', async () => {
          const mockRawActions = [...fakeActions].slice(0, 8);
          const expectedTimeline = {
            precedingSessions: [
              {
                start: 1648825140000,
                end: 1648826040000,
                actions: [
                  {
                    actionType: 'VIEW',
                    timestamp: 1648826040000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      contentIdKey: 'sftitle',
                      contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
                    },
                  },
                  {
                    actionType: 'CLICK',
                    timestamp: 1648825140000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'TtnKwc0Lo2GY9WAi',
                    },
                  },
                ],
              },
              {
                start: 1648822380000,
                end: 1648822620000,
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: 1648822500000,
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'KXñi9EWk38wnb1tt',
                    },
                  },
                ],
              },
            ],
            session: {
              start: 1648843800000,
              end: 1648843800000,
              actions: [
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: 1648843800000,
                  eventData: {},
                },
              ],
            },
            followingSessions: [],
          };

          const mappedAndSortedActions =
            mapAndSortActionsByMostRecent(mockRawActions);
          // Date far back before the first session
          const ticketCreationDate = createRelativeDate(
            firstSessionDate,
            5000,
            0
          ).getTime();

          const timeline = splitActionsIntoTimelineSessions(
            mappedAndSortedActions,
            ticketCreationDate,
            actionsToExclude
          );

          expect(timeline).toEqual(expectedTimeline);
        });
      });

      describe('when the ticket creation date falls between two sessions', () => {
        it('should return the timeline including current session timestamp set as the ticket creation date', async () => {
          const mockRawActions = [...fakeActions].slice(0, 8);
          const mappedAndSortedActions =
            mapAndSortActionsByMostRecent(mockRawActions);
          const ticketCreationDate = createRelativeDate(
            caseCreationDate,
            120,
            0
          ).getTime();

          const sessions = splitActionsIntoTimelineSessions(
            mappedAndSortedActions,
            ticketCreationDate,
            actionsToExclude
          );

          expect(sessions.session?.actions.length).toEqual(1);
          expect(sessions.session?.actions[0].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
          expect(sessions.session?.actions[0].timestamp).toEqual(
            ticketCreationDate
          );
        });
      });
    });
  });

  describe('#isActionWithinSessionThreshold', () => {
    it('should return true if the action is within the session inactivity threshold of the latest session action', async () => {
      const action = {
        actionType: 'CLICK' as UserActionType,
        timestamp: firstSessionDate.getTime(),
        eventData: {},
        searchHub: 'in-product-help',
        document: {title: 'title', uriHash: 'TtnKwc0Lo2GY9WAi'},
      };

      // Added 1 min to action timestamp, so it is within 30 mins of the previous action
      const previousEndDateTime = createRelativeDate(
        firstSessionDate,
        1,
        0
      ).getTime();

      const isSameSession = isActionWithinSessionThreshold(
        action,
        previousEndDateTime
      );
      expect(isSameSession).toEqual(true);
    });

    it('should return false if the action is not within 30mins of the previous', async () => {
      const action = {
        actionType: 'CLICK' as UserActionType,
        timestamp: firstSessionDate.getTime(),
        eventData: {},
        searchHub: 'in-product-help',
        document: {title: 'title', uriHash: 'TtnKwc0Lo2GY9WAi'},
      };

      // Added 1 hour to action timestamp, so it is not within 30 mins of the previous action
      const previousEndDateTime = createRelativeDate(
        firstSessionDate,
        60,
        0
      ).getTime();

      const isSameSession = isActionWithinSessionThreshold(
        action,
        previousEndDateTime
      );
      expect(isSameSession).toEqual(false);
    });
  });

  describe('#preprocessActionsData', () => {
    describe('when ticket creation date is not provided', () => {
      it('should return an empty timeline', async () => {
        const expectedTimeline = {
          precedingSessions: [],
          session: undefined,
          followingSessions: [],
        };
        const mockState = {
          excludedCustomActions: ['useless_event'],
          ticketCreationDate: undefined,
          loading: false,
        };

        const timeline = preprocessActionsData(mockState, fakeActions);

        expect(timeline).toEqual(expectedTimeline);
      });
    });

    describe('when the ticket creation date is provided', () => {
      it('should return a timeline with the case creation session', () => {
        const ticketCreationDate = caseCreationDate.getTime();
        const mockState = {
          excludedCustomActions: ['useless_event'],
          ticketCreationDate: new Date(ticketCreationDate).toISOString(),
          loading: false,
        };
        const preprocessedTimeline = preprocessActionsData(
          mockState,
          fakeActions
        );

        expect(preprocessedTimeline).toEqual(expectedTimeline);
      });
    });
  });
});
