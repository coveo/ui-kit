import {ExecutionPlan, getExecutionPlan} from './plan-endpoint';
import {HeadlessState} from '@coveo/headless';
import {SearchAPIClient, SearchAPIClientOptions} from '../search-api-client';
import {TriggerRedirect} from '../trigger';
import {PlanResponse} from './plan-response';
import {PlanRequestParams} from './plan-request';

jest.mock('../search-api-client');
describe('plan endpoint', () => {
  const state = {
    configuration: {
      accessToken: 'mytoken123',
      organizationId: 'myorg',
      search: {
        endpoint: 'myendpoint.com/rest/search',
      },
    },
    query: {
      q: 'query',
    },
  } as HeadlessState;

  it('should call SearchAPIClient.plan with the right parameters', () => {
    const expectedRequest: SearchAPIClientOptions<PlanRequestParams> = {
      accessToken: state.configuration.accessToken,
      endpoint: state.configuration.search.endpoint,
      requestParams: {
        organizationId: state.configuration.organizationId,
        q: state.query.q,
      },
    };
    getExecutionPlan(state);
    expect(SearchAPIClient.plan).toHaveBeenCalledWith(expectedRequest);
  });
});

describe('execution plan', () => {
  const planResponse: PlanResponse = {
    parsedInput: {
      basicExpression: 'some query',
      largeExpression: '',
    },
    preprocessingOutput: {
      triggers: [],
    },
  };
  let plan: ExecutionPlan;

  beforeEach(() => {
    plan = new ExecutionPlan(planResponse);
  });

  it('should extract basicExpression', () => {
    expect(plan.basicExpression).toBe(planResponse.parsedInput.basicExpression);
  });

  it('should extract largeExpression', () => {
    expect(plan.largeExpression).toBe(planResponse.parsedInput.largeExpression);
  });

  it('should extract the first redirect trigger for the redirectionURL', () => {
    const redirectTriggers: TriggerRedirect[] = [
      {
        type: 'redirect',
        content: 'thisisaurl.com',
      },
      {
        type: 'redirect',
        content: 'thisisanotherurl.com',
      },
    ];
    planResponse.preprocessingOutput.triggers = redirectTriggers;

    expect(new ExecutionPlan(planResponse).redirectionURL).toBe(
      'thisisaurl.com'
    );
  });
});
