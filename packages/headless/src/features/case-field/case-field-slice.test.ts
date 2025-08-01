import type {GetCaseClassificationsResponse} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-response.js';
import {setError} from '../error/error-actions.js';
import {
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from './case-field-actions.js';
import {caseFieldReducer} from './case-field-slice.js';
import {
  type CaseFieldState,
  getCaseFieldInitialState,
} from './case-field-state.js';

describe('case field slice', () => {
  let state: CaseFieldState;
  const testField = {
    fieldName: 'test-field-name',
    fieldValue: 'test-field-value',
  };

  beforeEach(() => {
    state = getCaseFieldInitialState();
  });

  it('should have an initial state', () => {
    expect(caseFieldReducer(undefined, {type: 'foo'})).toEqual(
      getCaseFieldInitialState()
    );
  });

  describe('#registerCaseField', () => {
    it('should allow to set a case field', () => {
      expect(
        caseFieldReducer(state, registerCaseField(testField)).fields[
          testField.fieldName
        ].value
      ).toEqual(testField.fieldValue);
    });
  });

  describe('#updateCaseField', () => {
    const existingField = {
      fieldName: 'existing-field-name',
      fieldValue: 'existing-field-value',
    };
    const existingSuggestions = [
      {
        id: 'id',
        value: 'value',
        confidence: 0.8,
      },
    ];

    beforeEach(() => {
      state.fields = {
        [existingField.fieldName]: {
          value: existingField.fieldValue,
          suggestions: existingSuggestions,
        },
      };
    });

    it('should allow to update a case field without affecting suggestions', () => {
      const updatedValue = 'updated-value';
      const modifiedState = caseFieldReducer(
        state,
        updateCaseField({...existingField, fieldValue: updatedValue})
      );
      expect(modifiedState.fields[existingField.fieldName].value).toEqual(
        updatedValue
      );
      expect(modifiedState.fields[existingField.fieldName].suggestions).toEqual(
        existingSuggestions
      );
    });
  });

  describe('#fetchCaseClassifications', () => {
    const buildMockCaseClassificationResponse = (
      fieldName: string
    ): GetCaseClassificationsResponse => ({
      fields: {
        [fieldName]: {
          predictions: [
            {
              id: 'prediction-id',
              value: 'prediction-value',
              confidence: 0.9,
            },
          ],
        },
      },
      responseId: 'response-id',
    });

    it('when a fetchCaseClassifications fulfilled is received, it updates the state to the received payload', () => {
      const response = buildMockCaseClassificationResponse(testField.fieldName);
      state.fields = {
        [testField.fieldName]: {
          value: testField.fieldValue,
          suggestions: [],
        },
      };
      const action = fetchCaseClassifications.fulfilled(
        {
          response: response,
        },
        ''
      );
      const finalState = caseFieldReducer(state, action);

      expect(finalState.fields[testField.fieldName].suggestions).toEqual(
        response.fields[testField.fieldName].predictions
      );
      expect(finalState.status.loading).toBe(false);
      expect(finalState.status.error).toBeNull();
    });

    it('set the error on rejection', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = fetchCaseClassifications.rejected(null, '');
      action.payload = err;
      const finalState = caseFieldReducer(state, action);
      expect(finalState.status.error).toEqual(err);
      expect(finalState.status.loading).toBe(false);
    });

    it('set the isLoading state to true during fetchCaseClassifications.pending', () => {
      const pendingAction = fetchCaseClassifications.pending('');
      const finalState = caseFieldReducer(state, pendingAction);
      expect(finalState.status.loading).toBe(true);
    });
  });

  describe('#setError', () => {
    it('should set the error state and set loading to false', () => {
      const error = {
        status: 400,
        statusCode: 401,
        message: 'message',
        type: 'Error',
      };
      const finalState = caseFieldReducer(state, setError(error));

      expect(finalState.status.error).toEqual(error);
      expect(finalState.status.loading).toBe(false);
    });
  });
});
