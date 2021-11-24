import {setCaseInput} from './case-input-actions';
import {caseInputsReducer} from './case-input-slice';
import {getCaseInputInitialState, CaseInputsState} from './case-input-state';

describe('case input slice', () => {
  const testMapping = {fieldName: 'foo', fieldValue: 'fooValue'};

  let state: CaseInputsState;

  beforeEach(() => {
    state = getCaseInputInitialState();
  });

  it('should have an initial state', () => {
    expect(caseInputsReducer(undefined, {type: 'foo'})).toEqual(
      getCaseInputInitialState()
    );
  });

  it('should allow to set a new case input entry', () => {
    expect(
      caseInputsReducer(state, setCaseInput(testMapping))[testMapping.fieldName]
        .value
    ).toEqual(testMapping.fieldValue);
  });

  it('should allow to update a case input entry', () => {
    const newValue = 'newValue';
    state[testMapping.fieldName] = {
      value: testMapping.fieldValue,
    };
    expect(
      caseInputsReducer(
        state,
        setCaseInput({fieldName: testMapping.fieldName, fieldValue: newValue})
      )[testMapping.fieldName].value
    ).toEqual(newValue);
  });
});
