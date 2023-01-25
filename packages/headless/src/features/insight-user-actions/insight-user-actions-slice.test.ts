import {
  InsightUserActionsResponse,
  UserActionType,
} from '../../api/service/insight/user-actions/user-actions-response';
import {
  fetchUserActions,
  registerUserActions,
} from './insight-user-actions-actions';
import {insightUserActionsReducer} from './insight-user-actions-slice';
import {getInsightUserActionsInitialState} from './insight-user-actions-state';

describe('insight user actions slice', () => {
  const requestId = 'some-request-id';
  const errorResponse = {
    message: 'something bad happened',
    statusCode: 400,
    type: 'badluck',
  };
  const session = {
    start: '2023-01-04T20:05:13.741Z',
    end: '2023-01-04T21:00:42.741Z',
    actions: [
      {
        actionType: UserActionType.CLICK,
        timestamp: '2022-12-04T20:05:13.741Z',
        eventData: {
          type: 'click',
        },
        cause: 'resultClick',
        searchHub: 'someSearchHub',
        document: {
          title: 'How to do that thing I need to do',
          clickUri: 'https://www.insightfulwebsite.com/how-to',
        },
      },
    ],
  };

  it('should have an initial state', () => {
    expect(insightUserActionsReducer(undefined, {type: 'foo'})).toEqual(
      getInsightUserActionsInitialState()
    );
  });

  describe('#fetchUserActions', () => {
    it('should set #loading to #true when fetching the user actions', () => {
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        fetchUserActions.pending(requestId)
      );

      expect(modifiedState.loading).toBe(true);
    });

    it('should clear the #error when fetching the user actions', () => {
      const errorState = {
        ...getInsightUserActionsInitialState(),
        error: errorResponse,
      };

      const modifiedState = insightUserActionsReducer(
        errorState,
        fetchUserActions.pending(requestId)
      );

      expect(modifiedState.error).toBeUndefined();
    });

    describe('when fetching user actions fails', () => {
      const failedAction = fetchUserActions.rejected(
        null,
        requestId,
        null as unknown as void,
        errorResponse
      );

      it('should set #loading to #false', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          failedAction
        );

        expect(modifiedState.loading).toBe(false);
      });

      it('should set #error', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          failedAction
        );

        expect(modifiedState.error).toStrictEqual(errorResponse);
      });

      it('should set #timeline to #undefined', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          failedAction
        );

        expect(modifiedState.timeline).toBeUndefined();
      });
    });

    describe('when fetching the user actions succeeds', () => {
      const response: InsightUserActionsResponse = {
        timeline: {
          precedingSessions: [session],
          session: session,
          followingSessions: [],
        },
      };
      const fetchUserActionsResponse = {
        response: response,
      };

      it('should set #loading to #false', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          fetchUserActions.fulfilled(fetchUserActionsResponse, requestId)
        );

        expect(modifiedState.loading).toBe(false);
      });

      it('should update the #timeline when user actions are returned', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          fetchUserActions.fulfilled(fetchUserActionsResponse, requestId)
        );

        const {timeline} = fetchUserActionsResponse.response;

        expect(modifiedState.timeline).toStrictEqual(timeline);
      });

      it('should set #error to #undefined', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          fetchUserActions.fulfilled(fetchUserActionsResponse, requestId)
        );

        expect(modifiedState.error).toBeUndefined();
      });
    });
  });

  describe('registerUserActions', () => {
    const testCreationDate = '2023-01-04T20:05:13.741Z';

    it('should set the #ticketCreationDate', () => {
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: testCreationDate,
        })
      );

      expect(modifiedState.ticketCreationDate).toBe(testCreationDate);
    });

    it('should set the #numberSessionsAfter', () => {
      const testNumberSessionsAfter = 5;
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: testCreationDate,
          numberSessionsAfter: testNumberSessionsAfter,
        })
      );

      expect(modifiedState.numberSessionsAfter).toBe(testNumberSessionsAfter);
    });

    it('should set the #numberSessionsBefore', () => {
      const testNumberSessionsBefore = 5;
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: testCreationDate,
          numberSessionsBefore: testNumberSessionsBefore,
        })
      );

      expect(modifiedState.numberSessionsBefore).toBe(testNumberSessionsBefore);
    });

    it('should set valid #excludedCustomActions', () => {
      const testExcludedCustomActions = ['badAction'];
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: testCreationDate,
          excludedCustomActions: testExcludedCustomActions,
        })
      );

      expect(modifiedState.excludedCustomActions).toBe(
        testExcludedCustomActions
      );
    });
  });
});
