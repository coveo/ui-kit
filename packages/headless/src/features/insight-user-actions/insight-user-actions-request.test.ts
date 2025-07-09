import {getOrganizationEndpoint} from '../../api/platform-client.js';
import type {InsightAppState} from '../../state/insight-app-state.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {buildFetchUserActionsRequest} from './insight-user-actions-request.js';

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

  it('#buildFetchUserActionsRequest returns the default organization endpoint base url', async () => {
    const params = await buildFetchUserActionsRequest(state, exampleUserId);

    expect(params.url).toBe(
      getOrganizationEndpoint(
        state.configuration.organizationId,
        state.configuration.environment
      )
    );
  });

  it('#buildFetchUserActionsRequest returns the state #userId', async () => {
    const params = await buildFetchUserActionsRequest(state, exampleUserId);

    expect(params.userId).toBe(exampleUserId);
  });
});
