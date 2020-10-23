import {fieldsReducer} from './fields-slice';
import {registerFieldsToInclude} from './fields-actions';
import {FieldsState, getFieldsInitialState} from './fields-state';

describe('fields slice', () => {
  it('should have initial state', () => {
    expect(fieldsReducer(undefined, {type: 'randomAction'})).toEqual(
      getFieldsInitialState()
    );
  });

  it('should handle registerFieldsToInclude on initial state', () => {
    const expectedState: FieldsState = {
      ...getFieldsInitialState(),
      fieldsToInclude: [
        ...getFieldsInitialState().fieldsToInclude,
        'field1',
        'field2',
      ],
    };

    const action = registerFieldsToInclude(['field1', 'field2']);
    expect(fieldsReducer(undefined, action)).toEqual(expectedState);
  });

  it('should not have duplicate fields', () => {
    const action = registerFieldsToInclude(['author', 'language']);
    expect(fieldsReducer(undefined, action)).toEqual(getFieldsInitialState());
  });
});
