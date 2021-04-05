import {createReducer} from '@reduxjs/toolkit';
import {
  executeGetUserActions,
  updateUserProfileUserId,
} from './user-profile-actions';
import {
  getUserProfileInitialState,
  UserProfileState,
} from './user-profile-state';

type UserProfileAction = typeof executeGetUserActions;

function handleFulfilledUserActionsRequest(
  state: UserProfileState,
  action: ReturnType<UserProfileAction['fulfilled']>
) {
  state.userActions.error = null;
  state.userActions.actions = action.payload.userActions;
  state.userActions.duration = action.payload.duration;
  state.userActions.isLoading = false;
}

function handleRejectedUserActionsRequest(
  state: UserProfileState,
  action: ReturnType<UserProfileAction['rejected']>
) {
  state.userActions.error = action.payload ? action.payload.error : null;
  state.userActions.isLoading = false;
}

export const userProfileReducer = createReducer(
  getUserProfileInitialState(),
  (builder) => {
    builder.addCase(updateUserProfileUserId, (state, action) => {
      if (action.payload.userId) {
        state.userId = action.payload.userId;
      }
    });
    builder.addCase(
      executeGetUserActions.rejected,
      handleRejectedUserActionsRequest
    );
    builder.addCase(
      executeGetUserActions.fulfilled,
      handleFulfilledUserActionsRequest
    );
    builder.addCase(executeGetUserActions.pending, (state) => {
      state.userActions.isLoading = true;
    });
  }
);
