import {executeGetUserActions} from '../../features/user-profile/user-profile-actions';
import {UserProfileAppState} from '../../state/user-profile-app-state';
import {
  buildMockUserProfileAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {buildUserActions, UserActions} from './headless-user-actions';

describe('User Actions', () => {
  const testId = 'mock-id-123';
  let engine: MockEngine<UserProfileAppState>;
  let userActions: UserActions;

  beforeEach(() => {
    engine = buildMockUserProfileAppEngine();
    userActions = buildUserActions(engine, {options: {userId: testId}});
  });

  it('initializes', () => {
    expect(userActions).toBeTruthy();
  });

  it('update dispatches a executeGetUserActions action', () => {
    userActions.update();

    const action = engine.actions.find(
      (action) => action.type === executeGetUserActions.pending.type
    );
    expect(action).toBeTruthy;
  });
});
