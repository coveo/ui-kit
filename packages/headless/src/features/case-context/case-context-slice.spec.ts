import {setCaseContext} from './case-context-actions';
import {caseContextReducer} from './case-context-slice';

describe('case context slice', () => {
  it('initializes state correctly', () => {
    const finalState = caseContextReducer(undefined, {type: ''});
    expect(finalState).toEqual({caseContext: {}});
  });

  it('stores the object in state', () => {
    const payload = {price: 'cad'};
    const action = setCaseContext(payload);

    const {caseContext} = caseContextReducer(undefined, action);
    expect(caseContext).toEqual(payload);
  });

  it('when the payload is not an object, the action contains an error', () => {
    const payload = setCaseContext(
      undefined as unknown as Record<string, string>
    );
    expect('error' in payload).toBe(true);
  });

  it('when a value is not a string, the action contains an error', () => {
    const payload = setCaseContext({
      a: true,
    } as unknown as Record<string, string>);
    expect('error' in payload).toBe(true);
  });
});
