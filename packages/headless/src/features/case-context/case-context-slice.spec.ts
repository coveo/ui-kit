import {
  setCaseContext,
  setCaseId,
  setCaseNumber,
} from './case-context-actions.js';
import {caseContextReducer} from './case-context-slice.js';

describe('case context slice', () => {
  it('initializes state correctly', () => {
    const finalState = caseContextReducer(undefined, {type: ''});
    expect(finalState).toEqual({caseContext: {}, caseId: '', caseNumber: ''});
  });

  describe('caseContext', () => {
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

  describe('caseId', () => {
    it('stores the case id in state', () => {
      const payload = 'example case id';
      const action = setCaseId(payload);

      const {caseId} = caseContextReducer(undefined, action);
      expect(caseId).toEqual(payload);
    });

    it('when the payload is not a string, the action contains an error', () => {
      const payload = setCaseId(undefined as unknown as string);
      expect('error' in payload).toBe(true);
    });
  });

  describe('caseNumber', () => {
    it('stores the case number in state', () => {
      const payload = 'example case number';
      const action = setCaseNumber(payload);

      const {caseNumber} = caseContextReducer(undefined, action);
      expect(caseNumber).toEqual(payload);
    });

    it('when the payload is not a string, the action contains an error', () => {
      const payload = setCaseNumber(undefined as unknown as string);
      expect('error' in payload).toBe(true);
    });
  });
});
