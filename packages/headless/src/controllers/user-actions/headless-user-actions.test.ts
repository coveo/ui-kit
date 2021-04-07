import {Result} from '../../api/search/search/result';
import {executeGetUserActions} from '../../features/user-profile/user-profile-actions';
import {
  UserAction,
  UserActionType,
} from '../../features/user-profile/user-profile-state';
import {UserProfileAppState} from '../../state/user-profile-app-state';
import {buildMockResult} from '../../test';
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

  function createFakeDocumentClickAction(fakeResult: Result) {
    return new UserAction(UserActionType.Click, new Date(), {}, fakeResult);
  }

  function createFakeQueryAction(fakeQuery: string) {
    return new UserAction(
      UserActionType.Click,
      new Date(),
      {},
      undefined,
      fakeQuery
    );
  }

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

  describe('with pre-existing actions in store', () => {
    let fakeResult: Result;
    let fakeQuery: string;

    beforeEach(() => {
      fakeResult = buildMockResult();
      fakeQuery = 'bears, beets, battlestar galactica';

      Array.prototype.push.apply(engine.state.userProfile.userActions.actions, [
        createFakeDocumentClickAction(fakeResult),
        createFakeQueryAction(fakeQuery),
      ]);
    });

    it('recentlyClickedDocuments returns an array of documents', () => {
      expect(userActions.recentlyClickedDocuments).toEqual([fakeResult]);
    });

    it('recentQueries returns an array of queries', () => {
      expect(userActions.recentQueries).toEqual([fakeQuery]);
    });
  });

  describe('without pre-existing actions in store', () => {
    it('recentlyClickedDocuments returns an array of documents', () => {
      expect(userActions.recentlyClickedDocuments).toEqual([]);
    });

    it('recentQueries returns an array of queries', () => {
      expect(userActions.recentQueries).toEqual([]);
    });
  });
});
