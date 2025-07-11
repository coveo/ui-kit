import type {MockInstance} from 'vitest';
import {
  insertSessionInTimeline,
  isActionWithinSessionThreshold,
  mapAndSortActionsByMostRecent,
  preprocessUserActionsData,
  shouldExcludeAction,
  splitActionsIntoTimelineSessions,
} from './insight-user-actions-preprocessing.js';
import {
  type UserActionTimeline,
  UserActionType,
  type UserSession,
} from './insight-user-actions-state.js';

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
    time: createRelativeDate(caseCreationDate, -15, 0).getTime(),
    name: 'Custom',
    value: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'expandSmartSnippetSuggestion',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, 10, 0).getTime(),
    name: 'Click',
    value: {
      title: 'title',
      uri_hash: 'caCgiG2JPzjZfS7G',
      origin_level_1: 'in-product-help',
    },
  },
  {
    time: createRelativeDate(caseCreationDate, 30, 0).getTime(),
    name: 'Click',
    value: {
      title: 'title',
      uri_hash: 'caCgiG2JPzjZfS7G',
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
    time: createRelativeDate(firstSessionDate, 34, 30).getTime(),
    name: 'Custom',
    value: {
      event_type: 'smartSnippetSuggestions',
      event_value: 'likeSmartSnippet',
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
      // eslint-disable-next-line @cspell/spellchecker
      c_contentidkey: 'click_contentIdKey',
      // eslint-disable-next-line @cspell/spellchecker
      c_contentidvalue: 'click_contentIdValue',
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

describe('insight user actions preprocessing', () => {
  describe('#mapAndSortActionsByMostRecent', () => {
    it('should properly map and sort the raw user actions into UserAction objects', async () => {
      const expectedMappedAndSortedActions = [
        {
          actionType: 'VIEW',
          timestamp: new Date('Fri Apr 1 2022 15:14:00 GMT').valueOf(),
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            contentIdKey: 'sftitle',
            contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
          },
        },
        {
          actionType: 'CLICK',
          timestamp: new Date('Fri Apr 1 2022 14:59:00 GMT').valueOf(),
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'TtnKwc0Lo2GY9WAi',
            contentIdKey: 'click_contentIdKey',
            contentIdValue: 'click_contentIdValue',
          },
        },
        {
          actionType: 'CUSTOM',
          timestamp: new Date('Fri Apr 1 2022 14:17:00 GMT').valueOf(),
          eventData: {
            type: 'useless_event',
            value: '',
          },
          searchHub: 'community-support',
          document: {},
        },
        {
          actionType: 'SEARCH',
          timestamp: new Date('Fri Apr 1 2022 14:13:00 GMT').valueOf(),
          eventData: {},
          searchHub: 'in-product-help',
          document: {},
          query: '',
        },
        {
          actionType: 'CLICK',
          timestamp: new Date('Tue Mar 31 2022 17:00:00 GMT').valueOf(),
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'caCgiG2JPzjZfS7G',
          },
        },
        {
          actionType: 'CLICK',
          timestamp: new Date('Tue Mar 31 2022 16:40:00 GMT').valueOf(),
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'caCgiG2JPzjZfS7G',
          },
        },
        {
          actionType: 'CUSTOM',
          timestamp: new Date('Tue Mar 31 2022 16:15:00 GMT').valueOf(),
          eventData: {
            type: 'smartSnippetSuggestions',
            value: 'expandSmartSnippetSuggestion',
          },
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'CUSTOM',
          timestamp: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
          eventData: {
            type: 'smartSnippetSuggestions',
            value: 'likeSmartSnippet',
          },
          searchHub: 'in-product-help',
          document: {},
        },
        {
          actionType: 'CLICK',
          timestamp: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
          eventData: {},
          searchHub: 'in-product-help',
          document: {
            title: 'title',
            uriHash: 'someHash',
          },
        },
      ];
      const mockRawActions = [...fakeActions];
      const mappedAndSortedActions =
        mapAndSortActionsByMostRecent(mockRawActions);

      expect(mappedAndSortedActions).toEqual(expectedMappedAndSortedActions);
      expect(mappedAndSortedActions[0].timestamp).toBeGreaterThan(
        mappedAndSortedActions[1].timestamp
      );
    });

    describe('when a rawUserAction cannot be parsed', () => {
      let consoleWarnSpy: MockInstance;

      beforeAll(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
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
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#insertSessionInTimeline', () => {
    let mockTimeline: UserActionTimeline;
    let mockSession: UserSession;

    beforeEach(() => {
      mockTimeline = {
        precedingSessions: [],
        session: undefined,
        followingSessions: [],
      };

      mockSession = {
        start: new Date('Fri Apr 1 2022 14:15:00 GMT').valueOf(),
        end: new Date('Fri Apr 1 2022 14:30:00 GMT').valueOf(),
        actions: [
          {
            actionType: UserActionType.SEARCH,
            timestamp: new Date('Fri Apr 1 2022 14:30:00 GMT').valueOf(),
            eventData: {},
            query: 'search query',
          },
          {
            actionType: UserActionType.CLICK,
            timestamp: new Date('Fri Apr 1 2022 14:15:00 GMT').valueOf(),
            eventData: {},
          },
        ],
      };
    });

    it('should properly insert a given following session in the following sessions of the timeline', async () => {
      const ticketCreationDate = new Date(
        'Fri Apr 1 2022 12:00:00 GMT'
      ).valueOf();

      insertSessionInTimeline(mockSession, ticketCreationDate, mockTimeline);

      expect(mockTimeline.followingSessions.length).toEqual(1);
      expect(mockTimeline.followingSessions[0]).toEqual(mockSession);
    });

    it('should properly insert a given preceding session in the preceding sessions of the timeline', async () => {
      const ticketCreationDate = new Date(
        'Fri Apr 1 2022 20:30:00 GMT'
      ).valueOf();

      insertSessionInTimeline(mockSession, ticketCreationDate, mockTimeline);

      expect(mockTimeline.precedingSessions.length).toEqual(1);
      expect(mockTimeline.precedingSessions[0]).toEqual(mockSession);
    });

    it('should properly insert a given ticket creation session in the case creation session of the timeline', async () => {
      const ticketCreationDate = new Date(
        'Fri Apr 1 2022 14:25:00 GMT'
      ).valueOf();

      insertSessionInTimeline(mockSession, ticketCreationDate, mockTimeline);

      expect(mockTimeline.session).toEqual(mockSession);
      expect(mockTimeline.session?.actions[1].actionType).toEqual(
        UserActionType.TICKET_CREATION
      );
    });

    describe('when within the inactivity threshold before the start of the session', () => {
      it('should properly insert a given ticket creation session in the case creation session of the timeline', async () => {
        const ticketCreationDate = new Date(
          'Fri Apr 1 2022 14:00:00 GMT'
        ).valueOf();

        insertSessionInTimeline(mockSession, ticketCreationDate, mockTimeline);

        expect(mockTimeline.session).toEqual(mockSession);
        expect(mockTimeline.session?.actions[2].actionType).toEqual(
          UserActionType.TICKET_CREATION
        );
        expect(mockTimeline.session?.start).toEqual(ticketCreationDate);
      });
    });

    describe('when within the inactivity threshold after the end of the session', () => {
      it('should properly insert a given ticket creation session in the case creation session of the timeline', async () => {
        const ticketCreationDate = new Date(
          'Fri Apr 1 2022 14:45:00 GMT'
        ).valueOf();

        insertSessionInTimeline(mockSession, ticketCreationDate, mockTimeline);

        expect(mockTimeline.session).toEqual(mockSession);
        expect(mockTimeline.session?.actions[0].actionType).toEqual(
          UserActionType.TICKET_CREATION
        );
        expect(mockTimeline.session?.end).toEqual(ticketCreationDate);
      });
    });

    describe('when a session is empty', () => {
      it('should not insert the session in the timeline', async () => {
        const ticketCreationDate = new Date(
          'Fri Apr 1 2022 14:45:00 GMT'
        ).valueOf();

        insertSessionInTimeline(
          {
            start: new Date('Fri Apr 1 2022 14:15:00 GMT').valueOf(),
            end: new Date('Fri Apr 1 2022 14:30:00 GMT').valueOf(),
            actions: [],
          },
          ticketCreationDate,
          mockTimeline
        );

        expect(mockTimeline.session).toBeUndefined();
        expect(mockTimeline.followingSessions.length).toEqual(0);
        expect(mockTimeline.precedingSessions.length).toEqual(0);
      });
    });
  });

  describe('#splitActionsIntoTimelineSessions', () => {
    describe('when the ticket creation session is found among the user sessions', () => {
      describe('when the ticket creation date is within a session', () => {
        it('should properly split user actions into sessions and return the timeline including current session', () => {
          const mockRawActions = [...fakeActions];
          const expectedTimeline = {
            precedingSessions: [
              {
                start: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
                end: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'CUSTOM',
                    timestamp: new Date(
                      'Tue Mar 29 2022 9:24:30 GMT'
                    ).valueOf(),
                    eventData: {
                      type: 'smartSnippetSuggestions',
                      value: 'likeSmartSnippet',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                ],
              },
              {
                start: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
                end: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: new Date(
                      'Tue Mar 29 2022 8:51:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'someHash',
                    },
                  },
                ],
              },
            ],
            session: {
              start: new Date('Tue Mar 31 2022 16:15:00 GMT').valueOf(),
              end: new Date('Tue Mar 31 2022 17:00:00 GMT').valueOf(),
              actions: [
                {
                  actionType: 'CLICK',
                  timestamp: new Date('Tue Mar 31 2022 17:00:00 GMT').valueOf(),
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    title: 'title',
                    uriHash: 'caCgiG2JPzjZfS7G',
                  },
                },
                {
                  actionType: 'CLICK',
                  timestamp: new Date('Tue Mar 31 2022 16:40:00 GMT').valueOf(),
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    title: 'title',
                    uriHash: 'caCgiG2JPzjZfS7G',
                  },
                },
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: new Date('Thu Mar 31 2022 16:30:00 GMT').valueOf(),
                  eventData: {},
                },
                {
                  actionType: 'CUSTOM',
                  timestamp: new Date('Tue Mar 31 2022 16:15:00 GMT').valueOf(),
                  eventData: {
                    type: 'smartSnippetSuggestions',
                    value: 'expandSmartSnippetSuggestion',
                  },
                  searchHub: 'in-product-help',
                  document: {},
                },
              ],
            },
            followingSessions: [
              {
                start: new Date('Fri Apr 1 2022 14:59:00 GMT').valueOf(),
                end: new Date('Fri Apr 1 2022 15:14:00 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'VIEW',
                    timestamp: new Date(
                      'Fri Apr 1 2022 15:14:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      contentIdKey: 'sftitle',
                      contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
                    },
                  },
                  {
                    actionType: 'CLICK',
                    timestamp: new Date(
                      'Fri Apr 1 2022 14:59:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'TtnKwc0Lo2GY9WAi',
                      contentIdKey: 'click_contentIdKey',
                      contentIdValue: 'click_contentIdValue',
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
          expect(timeline.session).not.toBeUndefined();
          expect(timeline.followingSessions.length).toEqual(
            expectedTimeline.followingSessions.length
          );
          expect(timeline.precedingSessions.length).toEqual(
            expectedTimeline.precedingSessions.length
          );
          expect(timeline.session?.actions[2].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
        });
      });
    });

    describe('when it does not find a case creation session', () => {
      describe('when the ticket creation date comes before all the sessions', () => {
        it('should return the timeline with the ticket creation date set as the current session timestamp and following sessions', async () => {
          const mockRawActions = [...fakeActions];
          const expectedTimeline = {
            precedingSessions: [],
            session: {
              start: new Date('Mon Mar 28 2022 16:10:00 GMT').valueOf(),
              end: new Date('Mon Mar 28 2022 16:10:00 GMT').valueOf(),
              actions: [
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: new Date('Mon Mar 28 2022 16:10:00 GMT').valueOf(),
                  eventData: {},
                },
              ],
            },
            followingSessions: [
              {
                start: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
                end: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'CUSTOM',
                    timestamp: new Date(
                      'Tue Mar 29 2022 9:24:30 GMT'
                    ).valueOf(),
                    eventData: {
                      type: 'smartSnippetSuggestions',
                      value: 'likeSmartSnippet',
                    },
                    searchHub: 'in-product-help',
                    document: {},
                  },
                ],
              },
              {
                start: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
                end: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: new Date(
                      'Tue Mar 29 2022 8:51:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'someHash',
                    },
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
          expect(timeline.session).not.toBeUndefined();
          expect(timeline.session?.actions.length).toEqual(1);
          expect(timeline.followingSessions.length).toEqual(
            expectedTimeline.followingSessions.length
          );
          expect(timeline.precedingSessions.length).toEqual(0);
          expect(timeline.session?.actions[0].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
        });
      });

      describe('when the ticket creation date comes after all the sessions', () => {
        it('should return the timeline with the ticket creation date set as the current session timestamp and preceding sessions', async () => {
          const mockRawActions = [...fakeActions];
          const expectedTimeline = {
            precedingSessions: [
              {
                start: new Date('Fri Apr 1 2022 14:59:00 GMT').valueOf(),
                end: new Date('Fri Apr 1 2022 15:14:00 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'VIEW',
                    timestamp: new Date(
                      'Fri Apr 1 2022 15:14:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      contentIdKey: 'sftitle',
                      contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
                    },
                  },
                  {
                    actionType: 'CLICK',
                    timestamp: new Date(
                      'Fri Apr 1 2022 14:59:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'TtnKwc0Lo2GY9WAi',
                      contentIdKey: 'click_contentIdKey',
                      contentIdValue: 'click_contentIdValue',
                    },
                  },
                ],
              },
              {
                start: new Date('Tue Mar 31 2022 16:15:00 GMT').valueOf(),
                end: new Date('Tue Mar 31 2022 17:00:00 GMT').valueOf(),
                actions: [
                  {
                    actionType: 'CLICK',
                    timestamp: new Date(
                      'Tue Mar 31 2022 17:00:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'caCgiG2JPzjZfS7G',
                    },
                  },
                  {
                    actionType: 'CLICK',
                    timestamp: new Date(
                      'Tue Mar 31 2022 16:40:00 GMT'
                    ).valueOf(),
                    eventData: {},
                    searchHub: 'in-product-help',
                    document: {
                      title: 'title',
                      uriHash: 'caCgiG2JPzjZfS7G',
                    },
                  },
                  {
                    actionType: 'CUSTOM',
                    timestamp: new Date(
                      'Tue Mar 31 2022 16:15:00 GMT'
                    ).valueOf(),
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
              start: new Date('Fri Apr 1 2022 20:10:00 GMT').valueOf(),
              end: new Date('Fri Apr 1 2022 20:10:00 GMT').valueOf(),
              actions: [
                {
                  actionType: 'TICKET_CREATION',
                  timestamp: new Date('Fri Apr 1 2022 20:10:00 GMT').valueOf(),
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
          expect(timeline.session).not.toBeUndefined();
          expect(timeline.session?.actions.length).toEqual(1);
          expect(timeline.followingSessions.length).toEqual(0);
          expect(timeline.precedingSessions.length).toEqual(
            expectedTimeline.precedingSessions.length
          );
          expect(timeline.session?.actions[0].actionType).toEqual(
            UserActionType.TICKET_CREATION
          );
        });
      });

      describe('when the ticket creation date falls between two sessions', () => {
        it('should return the timeline including current session timestamp set as the ticket creation date', async () => {
          const mockRawActions = [...fakeActions];
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
    it('should return true if the action is within the session inactivity threshold', async () => {
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

    it('should return false if the action is not within the session inactivity threshold', async () => {
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

  describe('#shouldExcludeAction', () => {
    const actionsToExclude = ['useless_event'];

    const mockSearchAction = {
      actionType: 'SEARCH' as UserActionType,
      timestamp: new Date('Fri Apr 01 2022 14:13:00 GMT').valueOf(),
      eventData: {},
      searchHub: 'in-product-help',
      document: {
        title: 'title',
      },
      query: '',
    };

    const mockCustomAction = {
      actionType: 'CUSTOM' as UserActionType,
      timestamp: new Date('Fri Apr 01 2022 14:17:00 GMT').valueOf(),
      eventData: {type: 'useless_event', value: ''},
    };

    it('should return true if the action is in the excluded actions list', () => {
      const shouldExclude = shouldExcludeAction(
        mockCustomAction,
        actionsToExclude
      );
      expect(shouldExclude).toEqual(true);
    });

    it('should return false if the action is NOT in the excluded actions list', () => {
      mockCustomAction.eventData.type = 'useful_event';

      const shouldExclude = shouldExcludeAction(
        mockCustomAction,
        actionsToExclude
      );
      expect(shouldExclude).toEqual(false);
    });

    it('should return true if the action is an empty search', () => {
      const shouldExclude = shouldExcludeAction(
        mockSearchAction,
        actionsToExclude
      );
      expect(shouldExclude).toEqual(true);
    });

    it('should return false if the action is NOT an empty search', () => {
      mockSearchAction.query = 'some query';

      const shouldExclude = shouldExcludeAction(
        mockSearchAction,
        actionsToExclude
      );
      expect(shouldExclude).toEqual(false);
    });
  });

  describe('#preprocessUserActionsData', () => {
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

        const timeline = preprocessUserActionsData(mockState, fakeActions);

        expect(timeline).toEqual(expectedTimeline);
        expect(timeline.session).toBeUndefined();
        expect(timeline.followingSessions.length).toEqual(0);
        expect(timeline.precedingSessions.length).toEqual(0);
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

        const expectedTimeline = {
          precedingSessions: [
            {
              start: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
              end: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
              actions: [
                {
                  actionType: 'CUSTOM',
                  timestamp: new Date('Tue Mar 29 2022 9:24:30 GMT').valueOf(),
                  eventData: {
                    type: 'smartSnippetSuggestions',
                    value: 'likeSmartSnippet',
                  },
                  searchHub: 'in-product-help',
                  document: {},
                },
              ],
            },
            {
              start: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
              end: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
              actions: [
                {
                  actionType: 'CLICK',
                  timestamp: new Date('Tue Mar 29 2022 8:51:00 GMT').valueOf(),
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {title: 'title', uriHash: 'someHash'},
                },
              ],
            },
          ],
          session: {
            start: new Date('Tue Mar 31 2022 16:15:00 GMT').valueOf(),
            end: new Date('Tue Mar 31 2022 17:00:00 GMT').valueOf(),
            actions: [
              {
                actionType: 'CLICK',
                timestamp: new Date('Tue Mar 31 2022 17:00:00 GMT').valueOf(),
                eventData: {},
                searchHub: 'in-product-help',
                document: {title: 'title', uriHash: 'caCgiG2JPzjZfS7G'},
              },
              {
                actionType: 'CLICK',
                timestamp: new Date('Tue Mar 31 2022 16:40:00 GMT').valueOf(),
                eventData: {},
                searchHub: 'in-product-help',
                document: {title: 'title', uriHash: 'caCgiG2JPzjZfS7G'},
              },
              {
                actionType: 'TICKET_CREATION',
                timestamp: new Date('Thu Mar 31 2022 16:30:00 GMT').valueOf(),
                eventData: {},
              },
              {
                actionType: 'CUSTOM',
                timestamp: new Date('Tue Mar 31 2022 16:15:00 GMT').valueOf(),
                eventData: {
                  type: 'smartSnippetSuggestions',
                  value: 'expandSmartSnippetSuggestion',
                },
                searchHub: 'in-product-help',
                document: {},
              },
            ],
          },
          followingSessions: [
            {
              start: new Date('Fri Apr 1 2022 14:59:00 GMT').valueOf(),
              end: new Date('Fri Apr 1 2022 15:14:00 GMT').valueOf(),
              actions: [
                {
                  actionType: 'VIEW',
                  timestamp: new Date('Fri Apr 1 2022 15:14:00 GMT').valueOf(),
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    contentIdKey: 'sftitle',
                    contentIdValue: 'Speedbit Charge 2 User Manual.pdf',
                  },
                },
                {
                  actionType: 'CLICK',
                  timestamp: new Date('Fri Apr 1 2022 14:59:00 GMT').valueOf(),
                  eventData: {},
                  searchHub: 'in-product-help',
                  document: {
                    title: 'title',
                    uriHash: 'TtnKwc0Lo2GY9WAi',
                    contentIdKey: 'click_contentIdKey',
                    contentIdValue: 'click_contentIdValue',
                  },
                },
              ],
            },
          ],
        };

        const preprocessedTimeline = preprocessUserActionsData(
          mockState,
          fakeActions
        );

        expect(preprocessedTimeline).toEqual(expectedTimeline);
        expect(preprocessedTimeline.session).not.toBeUndefined();
        expect(preprocessedTimeline.precedingSessions.length).toEqual(
          expectedTimeline.precedingSessions.length
        );
        expect(preprocessedTimeline.followingSessions.length).toEqual(
          expectedTimeline.followingSessions.length
        );
        expect(preprocessedTimeline.session?.actions[2].actionType).toEqual(
          UserActionType.TICKET_CREATION
        );
      });
    });
  });
});
