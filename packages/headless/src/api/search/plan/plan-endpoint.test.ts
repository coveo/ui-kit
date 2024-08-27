import {TriggerRedirect} from '../../common/trigger';
import {ExecutionPlan} from './plan-endpoint';
import {PlanResponseSuccess} from './plan-response';

describe('execution plan', () => {
  const planResponse: PlanResponseSuccess = {
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

  it('should extract the first redirect trigger for the redirectionUrl', () => {
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

    expect(new ExecutionPlan(planResponse).redirectionUrl).toBe(
      'thisisaurl.com'
    );
  });
});
