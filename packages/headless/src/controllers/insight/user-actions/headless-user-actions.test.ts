import {configuration} from '../../../app/common-reducers';
import {
  fetchUserActions,
  registerUserActions,
} from '../../../features/insight-user-actions/insight-user-actions-actions';
import {insightUserActionsReducer} from '../../../features/insight-user-actions/insight-user-actions-slice';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  UserActions,
  UserActionsOptions,
  buildUserActions,
} from './headless-user-actions';

jest.mock(
  '../../../features/insight-user-actions/insight-user-actions-actions'
);

describe('UserActions', () => {
  let engine: MockedInsightEngine;

  let options: UserActionsOptions;
  let userActions: UserActions;

  function initUserActions() {
    userActions = buildUserActions(engine, {options});
  }

  const exampleUserId = 'John Doe';
  const exampleTicketCreationDate = '2024-07-16T21:00:42.741Z';
  const exampleExcludedCustomActions = ['badAction'];

  beforeEach(() => {
    options = {
      userId: exampleUserId,
      ticketCreationDate: exampleTicketCreationDate,
      excludedCustomActions: exampleExcludedCustomActions,
    };
    engine = buildMockInsightEngine(buildMockInsightState());

    initUserActions();
  });

  it('initializes', () => {
    expect(userActions).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      insightuserActions: insightUserActionsReducer,
    });
  });

  it('exposes a subscribe method', () => {
    expect(userActions.subscribe).toBeTruthy();
  });

  it('registers and updates the state with the given options', () => {
    expect(registerUserActions).toHaveBeenCalled();
    expect(registerUserActions).toHaveBeenCalledWith({
      userId: exampleUserId,
      ticketCreationDate: exampleTicketCreationDate,
      excludedCustomActions: exampleExcludedCustomActions,
    });
  });

  it('#fetchUserActions dispatches #fetchUserActions', () => {
    userActions.fetchUserActions();
    expect(fetchUserActions).toHaveBeenCalled();
  });
});
