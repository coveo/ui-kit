import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {
  KnownCaseFields,
  selectCase,
  selectCaseClassification,
  selectCaseFieldValue,
  selectCaseInputValue,
  selectCustomCaseFieldValues,
  selectCustomCaseInputValues,
} from './case-assist-analytics-selectors';

describe('case assist analytics selectors', () => {
  const stateWithCaseInputs: Partial<CaseAssistAppState> = {
    caseInputs: {
      id: {value: 'some-case-id'},
      subject: {value: 'some case subject'},
      description: {value: 'some case description'},
      productId: {value: 'some product ID'},
      customFieldA: {value: 'custom value'},
    },
  };

  const stateWithCaseFields: Partial<CaseAssistAppState> = {
    caseFields: {
      status: {
        loading: false,
        error: null,
        lastResponseId: 'last-response-id',
      },
      fields: {
        category: {
          value: 'software',
          suggestions: [
            {
              id: 'software-suggestion-id',
              value: 'software',
              confidence: 0.987,
            },
            {
              id: 'service-suggestion-id',
              value: 'service',
              confidence: 0.765,
            },
          ],
        },
        customFieldB: {
          value: 'custom value',
          suggestions: [],
        },
      },
    },
  };

  describe('#selectCase', () => {
    it('should retrieve all the case information from the state', () => {
      const caseInfo = selectCase({
        ...stateWithCaseInputs,
        ...stateWithCaseFields,
      });

      expect(caseInfo).toMatchObject({
        id: 'some-case-id',
        subject: 'some case subject',
        description: 'some case description',
        productId: 'some product ID',
        category: 'software',
        custom: {
          customFieldA: 'custom value',
          customFieldB: 'custom value',
        },
      });
    });
  });

  describe('#selectCaseInputValue', () => {
    it('should return the input value', () => {
      const value = selectCaseInputValue(stateWithCaseInputs, 'subject');

      expect(value).toBe('some case subject');
    });

    it('should return #undefined when field is not found', () => {
      const value = selectCaseInputValue(
        stateWithCaseInputs,
        'thisFieldDoesNotExist'
      );

      expect(value).toBeUndefined();
    });
  });

  describe('#selectCustomCaseInputValue', () => {
    it('should return all inputs except the known fields', () => {
      const customFields = selectCustomCaseInputValues(stateWithCaseInputs);

      expect(customFields).toHaveProperty('customFieldA', 'custom value');
      Object.values(KnownCaseFields).forEach((knownCaseField) =>
        expect(customFields).not.toHaveProperty(knownCaseField)
      );
    });

    it('should return an empty object if no custom fields', () => {
      const state = JSON.parse(JSON.stringify(stateWithCaseInputs));
      delete state.caseInputs.customFieldA;

      const customFields = selectCustomCaseInputValues(state);

      expect(Object.keys(customFields)).toHaveLength(0);
    });

    it('should return an empty object if custom field has no value', () => {
      const state = JSON.parse(JSON.stringify(stateWithCaseInputs));
      state.caseInputs.customFieldA.value = undefined;

      const customFields = selectCustomCaseInputValues(state);

      expect(customFields).not.toHaveProperty('customFieldA');
    });
  });

  describe('#selectCaseFieldValue', () => {
    it('should return the field value', () => {
      const value = selectCaseFieldValue(stateWithCaseFields, 'category');

      expect(value).toBe('software');
    });

    it('should return #undefined when field is not found', () => {
      const value = selectCaseFieldValue(
        stateWithCaseFields,
        'thisFieldDoesNotExist'
      );

      expect(value).toBeUndefined();
    });
  });

  describe('#selectCustomCaseFieldValue', () => {
    it('should return all fields except the known ones', () => {
      const customFields = selectCustomCaseFieldValues(stateWithCaseFields);

      expect(customFields).toHaveProperty('customFieldB', 'custom value');
      Object.values(KnownCaseFields).forEach((knownCaseField) =>
        expect(customFields).not.toHaveProperty(knownCaseField)
      );
    });

    it('should return an empty object if no custom fields', () => {
      const state = JSON.parse(JSON.stringify(stateWithCaseFields));
      delete state.caseFields.fields.customFieldB;

      const customFields = selectCustomCaseFieldValues(state);

      expect(Object.keys(customFields)).toHaveLength(0);
    });

    it('should return an empty object if custom field has no value', () => {
      const state = JSON.parse(JSON.stringify(stateWithCaseFields));
      state.caseFields.fields.customFieldB.value = undefined;

      const customFields = selectCustomCaseFieldValues(state);

      expect(customFields).not.toHaveProperty('customFieldB');
    });
  });

  describe('#selectCaseClassification', () => {
    it('should return the classification matching the specified ID', () => {
      const classification = selectCaseClassification(
        stateWithCaseFields,
        'service-suggestion-id'
      );

      expect(classification).toMatchObject({
        classificationId: 'service-suggestion-id',
        responseId: 'last-response-id',
        fieldName: 'category',
        classification: {
          value: 'service',
          confidence: 0.765,
        },
      });
    });

    it('should throw when the classification is not found', () => {
      expect(() =>
        selectCaseClassification(
          stateWithCaseFields,
          'invalid-classification-id'
        )
      ).toThrow();
    });
  });

  describe('#selectDocumentSuggestion', () => {
    it.todo('should return the document suggestion matching the specified ID');

    it.todo('should throw when the document suggestion is not found');
  });
});
