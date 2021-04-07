import {ReducersMapObject} from 'redux';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {debugReducer} from '../features/debug/debug-slice';
import {userProfileReducer} from '../features/user-profile/user-profile-slice';
import {UserProfileAppState} from '../state/user-profile-app-state';

/**
 * Map of reducers that make up the UserActionsAppState.
 */
export const userProfileAppReducers: ReducersMapObject<UserProfileAppState> = {
  configuration: configurationReducer,
  userProfile: userProfileReducer,
  debug: debugReducer,
};
