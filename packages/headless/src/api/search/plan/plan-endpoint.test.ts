import {ExecutionPlan} from './plan-endpoint';
import {TriggerRedirect} from '../trigger';
import {PlanResponse} from './plan-response';

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
