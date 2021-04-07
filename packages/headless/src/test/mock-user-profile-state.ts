import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getDebugInitialState} from '../features/debug/debug-state';
import {getUserProfileInitialState} from '../features/user-profile/user-profile-state';
import {UserProfileAppState} from '../state/user-profile-app-state';

export function createMockUserProfileState(
  config: Partial<UserProfileAppState> = {}
): UserProfileAppState {
  return {
    configuration: getConfigurationInitialState(),
    userProfile: getUserProfileInitialState(),
    debug: getDebugInitialState(),
    ...config,
  };
}
