import {GetCaseClassificationsResponse} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-response';
import {
  updateCaseField,
  enableCaseClassifications,
  disableCaseClassifications,
  fetchCaseClassifications,
  registerCaseField,
} from './case-field-actions';
import {caseFieldsReducer} from './case-field-slice';
import {getCaseFieldInitialState, CaseFieldsState} from './case-field-state';

describe('case field slice', () => {
  let state: CaseFieldsState;
  const testField = {
    fieldName: 'test-field-name',
    fieldValue: 'test-field-value',
  };

  beforeEach(() => {
    state = getCaseFieldInitialState();
  });

  it('should have an initial state', () => {
    expect(caseFieldsReducer(undefined, {type: 'foo'})).toEqual(
      getCaseFieldInitialState()
    );
  });

  describe('#registerCaseField', () => {
    it('should allow to set a case field', () => {
      expect(
        caseFieldsReducer(state, registerCaseField(testField)).fields[
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
      const modifiedState = caseFieldsReducer(
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

  describe('#enableCaseClassifications', () => {
    it('should allow to enable case classifications', () => {
      expect(state.enabled).toBe(false);
      expect(
        caseFieldsReducer(state, enableCaseClassifications()).enabled
      ).toBe(true);
    });
  });

  describe('#enableCaseClassifications', () => {
    it('should allow to enable case classifications', () => {
      state.enabled = true;
      expect(
        caseFieldsReducer(state, disableCaseClassifications()).enabled
      ).toBe(false);
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
      const finalState = caseFieldsReducer(state, action);

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
      const finalState = caseFieldsReducer(state, action);
      expect(finalState.status.error).toEqual(err);
      expect(finalState.status.loading).toBe(false);
    });

    it('set the isLoading state to true during getProductRecommendations.pending', () => {
      const pendingAction = fetchCaseClassifications.pending('');
      const finalState = caseFieldsReducer(state, pendingAction);
      expect(finalState.status.loading).toBe(true);
    });
  });
});
