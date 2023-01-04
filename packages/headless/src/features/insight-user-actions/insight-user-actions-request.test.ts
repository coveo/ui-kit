import {InsightAppState} from '../../state/insight-app-state';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildFetchUserActionsRequest} from './insight-user-actions-request';

describe('insight user actions request', () => {
  let state: InsightAppState;

  beforeEach(() => {
    state = buildMockInsightState();
  });

  it('#buildFetchUserActionsRequest returns the state #accessToken', async () => {
    state.configuration.accessToken = 'xxx-access-token';
    const params = await buildFetchUserActionsRequest(state);

    expect(params.accessToken).toBe(state.configuration.accessToken);
  });

  it('#buildFetchUserActionsRequest returns the state #organizationId', async () => {
    state.configuration.organizationId = 'someorgid';
    const params = await buildFetchUserActionsRequest(state);

    expect(params.organizationId).toBe(state.configuration.organizationId);
  });

  it('#buildFetchUserActionsRequest returns the state #platformUrl', async () => {
    state.configuration.platformUrl = 'https://platform.coveo.com';
    const params = await buildFetchUserActionsRequest(state);

    expect(params.url).toBe(state.configuration.platformUrl);
  });

  it('#buildFetchUserActionsRequest returns the state #insightId', async () => {
    state.insightConfiguration.insightId = 'some-insight-id-123';
    const params = await buildFetchUserActionsRequest(state);

    expect(params.insightId).toBe(state.insightConfiguration.insightId);
  });

  it('#buildFetchUserActionsRequest returns the state #ticketCreationDate', async () => {
    state.insightUserAction.ticketCreationDate = '2023-01-04T20:05:13.741Z';
    const params = await buildFetchUserActionsRequest(state);

    expect(params.ticketCreationDate).toBe(
      state.insightUserAction.ticketCreationDate
    );
  });

  it('#buildFetchUserActionsRequest returns the state #numberSessionsBefore', async () => {
    state.insightUserAction.numberSessionsBefore = 2;
    const params = await buildFetchUserActionsRequest(state);

    expect(params.numberSessionsBefore).toBe(
      state.insightUserAction.numberSessionsBefore
    );
  });

  it('#buildFetchUserActionsRequest returns the state #numberSessionsAfter', async () => {
    state.insightUserAction.numberSessionsAfter = 2;
    const params = await buildFetchUserActionsRequest(state);

    expect(params.numberSessionsAfter).toBe(
      state.insightUserAction.numberSessionsAfter
    );
  });

  it('#buildFetchUserActionsRequest returns the state #excludedCustomActions', async () => {
    state.insightUserAction.excludedCustomActions = ['testEvent'];
    const params = await buildFetchUserActionsRequest(state);

    expect(params.excludedCustomActions).toBe(
      state.insightUserAction.excludedCustomActions
    );
  });
});
