import {Action} from '@reduxjs/toolkit';
import {
  executeGetUserActions,
  updateUserProfileUserId,
} from './user-profile-actions';
import {userProfileReducer} from './user-profile-slice';
import {
  UserProfileState,
  getUserProfileInitialState,
  UserActionType,
} from './user-profile-state';

const rejectWithValue = (action: Action, payload: object) => ({
  type: action.type,
  meta: {
    requestId: 'some request id',
    rejectedWithValue: true,
    requestStatus: 'rejected',
    aborted: false,
    condition: false,
  },
  payload,
});

describe('case assist slice', () => {
  let state: UserProfileState;

  beforeEach(() => {
    state = getUserProfileInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = userProfileReducer(undefined, {type: ''});

    expect(finalState).toEqual(getUserProfileInitialState());
  });

  it('updateUserProfileUserId sets the value in the state', () => {
    const testId = 'test-id-123';
    const action = updateUserProfileUserId({
      userId: testId,
    });
    const finalState = userProfileReducer(state, action);

    expect(finalState.userId).toBe(testId);
  });

  it('executeGetUserActions.pending raises the loading flag', () => {
    const action = executeGetUserActions.pending('some request id');
    const finalState = userProfileReducer(state, action);

    expect(finalState.userActions.isLoading).toBe(true);
  });

  it('executeGetUserActions.fulfilled updates userActions', () => {
    const payload = {
      userActions: [
        {
          type: UserActionType.Search,
          timestamp: new Date(),
          raw: {},
        },
      ],
      duration: 0,
    };
    const action = executeGetUserActions.fulfilled(payload, 'some request id');
    const finalState = userProfileReducer(state, action);

    expect(finalState.userActions.isLoading).toBe(false);
    expect(finalState.userActions.actions).toEqual(payload.userActions);
    expect(finalState.userActions.error).toBeNull;
  });

  it('executeGetUserActions.rejected stores the error', () => {
    const expectedError = {
      statusCode: 400,
      message: 'some value is missing',
      type: 'invalid request',
    };
    const action = rejectWithValue(executeGetUserActions.rejected, {
      error: expectedError,
    });

    const finalState = userProfileReducer(state, action);

    expect(finalState.userActions.error).toEqual(expectedError);
    expect(finalState.userActions.isLoading).toBe(false);
  });
});
