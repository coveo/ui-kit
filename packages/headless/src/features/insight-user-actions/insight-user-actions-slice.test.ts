import {
  fetchUserActions,
  registerUserActions,
} from './insight-user-actions-actions.js';
import {insightUserActionsReducer} from './insight-user-actions-slice.js';
import {getInsightUserActionsInitialState} from './insight-user-actions-state.js';

describe('insight user actions slice', () => {
  const requestId = 'some-request-id';
  const exampleUserId = 'John Doe';
  const exampleTicketCreationDate = '2024-07-16T20:05:13.741Z';

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
        fetchUserActions.pending(exampleUserId, requestId)
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
        fetchUserActions.pending(exampleUserId, requestId)
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
          fetchUserActions.fulfilled(
            {response: {value: []}},
            exampleUserId,
            requestId
          )
        );

        expect(modifiedState.loading).toBe(false);
      });

      it('should set #error to #undefined', () => {
        const modifiedState = insightUserActionsReducer(
          getInsightUserActionsInitialState(),
          fetchUserActions.fulfilled(
            {response: {value: []}},
            exampleUserId,
            requestId
          )
        );

        expect(modifiedState.error).toBeUndefined();
      });
    });
  });

  describe('registerUserActions', () => {
    it('should set the #ticketCreationDate', () => {
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: exampleTicketCreationDate,
        })
      );

      expect(modifiedState.ticketCreationDate).toBe(exampleTicketCreationDate);
    });

    it('should set valid #excludedCustomActions', () => {
      const testExcludedCustomActions = ['badAction'];
      const modifiedState = insightUserActionsReducer(
        getInsightUserActionsInitialState(),
        registerUserActions({
          ticketCreationDate: exampleTicketCreationDate,
          excludedCustomActions: testExcludedCustomActions,
        })
      );

      expect(modifiedState.excludedCustomActions).toBe(
        testExcludedCustomActions
      );
    });
  });
});
