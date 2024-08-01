import {InsightAppState} from '../../state/insight-app-state';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildFetchUserActionsRequest} from './insight-user-actions-request';

describe('insight user actions request', () => {
  let state: InsightAppState;
  const exampleUserId = 'John Doe';

  beforeEach(() => {
    state = buildMockInsightState();
  });

  it('#buildFetchUserActionsRequest returns the state #accessToken', async () => {
    state.configuration.accessToken = 'xxx-access-token';
    const params = await buildFetchUserActionsRequest(state, exampleUserId);

    expect(params.accessToken).toBe(state.configuration.accessToken);
  });

  it('#buildFetchUserActionsRequest returns the state #organizationId', async () => {
    state.configuration.organizationId = 'example org id';
    const params = await buildFetchUserActionsRequest(state, exampleUserId);

    expect(params.organizationId).toBe(state.configuration.organizationId);
  });

  it('#buildFetchUserActionsRequest returns the state #platformUrl', async () => {
    state.configuration.platformUrl = 'https://platform.coveo.com';
    const params = await buildFetchUserActionsRequest(state, exampleUserId);

    expect(params.url).toBe(state.configuration.platformUrl);
  });

  it('#buildFetchUserActionsRequest returns the state #userId', async () => {
    const params = await buildFetchUserActionsRequest(state, exampleUserId);

    expect(params.userId).toBe(exampleUserId);
  });
});
