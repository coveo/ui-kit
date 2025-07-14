import {updateCaseInput} from './case-input-actions.js';
import {caseInputReducer} from './case-input-slice.js';
import {
  type CaseInputState,
  getCaseInputInitialState,
} from './case-input-state.js';

describe('case input slice', () => {
  const testMapping = {fieldName: 'foo', fieldValue: 'fooValue'};

  let state: CaseInputState;

  beforeEach(() => {
    state = getCaseInputInitialState();
  });

  it('should have an initial state', () => {
    expect(caseInputReducer(undefined, {type: 'foo'})).toEqual(
      getCaseInputInitialState()
    );
  });

  it('should allow to set a new case input entry', () => {
    expect(
      caseInputReducer(state, updateCaseInput(testMapping))[
        testMapping.fieldName
      ].value
    ).toEqual(testMapping.fieldValue);
  });

  it('should allow to update a case input entry', () => {
    const newValue = 'newValue';
    state[testMapping.fieldName] = {
      value: testMapping.fieldValue,
    };
    expect(
      caseInputReducer(
        state,
        updateCaseInput({
          fieldName: testMapping.fieldName,
          fieldValue: newValue,
        })
      )[testMapping.fieldName].value
    ).toEqual(newValue);
  });
});
