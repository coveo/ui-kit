import {createReducer} from '@reduxjs/toolkit';
import {
  executeGetUserActions,
  updateUserProfileUserId,
} from './user-profile-actions';
import {
  getUserProfileInitialState,
  UserProfileState,
} from './user-profile-state';

function handleRejectedRequest(
  state: UserProfileState,
  action: ReturnType<typeof executeGetUserActions['rejected']>
) {
  state.userActions.error = action.payload ? action.payload : null;
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
    builder.addCase(executeGetUserActions.rejected, handleRejectedRequest);
    builder.addCase(executeGetUserActions.fulfilled, (state, action) => {
      state.userActions.error = null;
      state.userActions.actions = action.payload.userActions;
      state.userActions.duration = action.payload.duration;
      state.userActions.isLoading = false;
    });
    builder.addCase(executeGetUserActions.pending, (state) => {
      state.userActions.isLoading = true;
    });
  }
);
