import {setCaseInput} from './case-inputs-actions';
import {caseInputsReducer} from './case-inputs-slice';
import {getCaseInputsInitialState, CaseInputsState} from './case-inputs-state';

describe('case inputs slice', () => {
  const testMapping = {fieldName: 'foo', fieldValue: 'fooValue'};

  let state: CaseInputsState;

  beforeEach(() => {
    state = getCaseInputsInitialState();
  });

  it('should have an initial state', () => {
    expect(caseInputsReducer(undefined, {type: 'foo'})).toEqual(
      getCaseInputsInitialState()
    );
  });

  it('should allow to set a new case input entry', () => {
    expect(
      caseInputsReducer(state, setCaseInput(testMapping))[testMapping.fieldName]
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
      )[testMapping.fieldName]
    ).toEqual(newValue);
  });
});
