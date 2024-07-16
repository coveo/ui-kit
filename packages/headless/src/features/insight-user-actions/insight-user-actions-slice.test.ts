import {
  fetchUserActions,
  registerUserActions,
} from './insight-user-actions-actions';
import {insightUserActionsReducer} from './insight-user-actions-slice';
import {getInsightUserActionsInitialState} from './insight-user-actions-state';

describe('insight user actions slice', () => {
  const requestId = 'some-request-id';
  const exampleUserId = 'John Doe';

  const errorResponse = {
    message: 'something bad happened',
    statusCode: 400,
    type: 'badluck',
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
      const failedAction = {
        type: fetchUserActions.rejected.type,
        payload: errorResponse,
      };

      it('should set #loading to #false', () => {
        const modifiedState = insightUserActionsReducer(
          {
            ...getInsightUserActionsInitialState(),
            loading: true,
          },
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
      it('should set #loading to #false', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          fetchUserActions.fulfilled({response: {value: []}}, requestId)
        );

        expect(modifiedState.loading).toBe(false);
      });

      it('should set #error to #undefined', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          fetchUserActions.fulfilled({response: {value: []}}, requestId)
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
          userId: exampleUserId,
        })
      );

      expect(modifiedState.ticketCreationDate).toBe(testCreationDate);
    });

    it('should set the #userId', () => {
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: testCreationDate,
          userId: exampleUserId,
        })
      );

      expect(modifiedState.userId).toBe(exampleUserId);
    });

    it('should set valid #excludedCustomActions', () => {
      const testExcludedCustomActions = ['badAction'];
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: testCreationDate,
          userId: exampleUserId,
          excludedCustomActions: testExcludedCustomActions,
        })
      );

      expect(modifiedState.excludedCustomActions).toBe(
        testExcludedCustomActions
      );
    });
  });
});
