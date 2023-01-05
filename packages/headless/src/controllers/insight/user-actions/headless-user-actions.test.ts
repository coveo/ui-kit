import {
  fetchUserActions,
  registerUserActions,
} from '../../../features/insight-user-actions/insight-user-actions-actions';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {
  UserActions,
  UserActionsOptions,
  buildUserActions,
} from './headless-user-actions';

describe('UserActions', () => {
  let engine: MockInsightEngine;
  let options: UserActionsOptions;
  let userActions: UserActions;

  function initUserActions() {
    userActions = buildUserActions(engine, {options});
  }

  beforeEach(() => {
    options = {
      ticketCreationDate: '2023-01-04T21:00:42.741Z',
      numberSessionsBefore: 5,
      numberSessionsAfter: 2,
      excludedCustomActions: ['badAction'],
    };
    engine = buildMockInsightEngine();
    initUserActions();
  });

  it('initializes', () => {
    expect(userActions).toBeTruthy();
  });

  it('registers and updates the state with the given options', () => {
    expect(engine.actions).toContainEqual(registerUserActions(options));
  });

  it('#state.numberSessionsBefore returns 0 by default', () => {
    expect(userActions.state.numberSessionsBefore).toBe(0);
  });

  it('#state.numberSessionsAfter returns 0 by default', () => {
    expect(userActions.state.numberSessionsAfter).toBe(0);
  });

  it('#state.excludedCustomActions returns an empty array by default', () => {
    expect(userActions.state.excludedCustomActions).toEqual([]);
  });

  it('#fetchUserActions dispatches #fetchUserActions', () => {
    userActions.fetchUserActions();
    const action = engine.findAsyncAction(fetchUserActions.pending);

    expect(action).toBeTruthy();
  });

  it('#fetchWithPrecedingSession dispatches #fetchUserActions', () => {
    userActions.fetchWithPrecedingSession();
    const action = engine.findAsyncAction(fetchUserActions.pending);

    expect(action).toBeTruthy();
  });

  it('#fetchWithFollowingSession dispatches #fetchUserActions', () => {
    userActions.fetchWithFollowingSession();
    const action = engine.findAsyncAction(fetchUserActions.pending);

    expect(engine.actions).toContainEqual(action);
  });
});
