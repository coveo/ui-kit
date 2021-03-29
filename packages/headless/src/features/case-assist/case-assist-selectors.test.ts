import {
  getClassificationById,
  getDocumentSuggestionById,
} from './case-assist-selectors';
import {CaseAssistState, getCaseAssistInitialState} from './case-assist-state';

describe('case assist selectors', () => {
  let state: CaseAssistState;

  beforeEach(() => {
    state = getCaseAssistInitialState();
  });

  describe('getClassificationById', () => {
    const buildFieldClassification = (
      fieldName: string,
      classificationId: string
    ) => {
      return {
        name: fieldName,
        predictions: [
          {
            id: classificationId,
            value: 'some classification',
            confidence: 0.987,
          },
        ],
      };
    };

    it('should return the classification from the state', () => {
      const expectedClassificationId = '7d24755f-2b6c-4c9b-b8ad-8ff52bb8897b';
      const expectedFieldName = 'some field';
      const fieldClassification = buildFieldClassification(
        expectedFieldName,
        expectedClassificationId
      );
      state.classifications.fields.push(fieldClassification);

      const classification = getClassificationById(
        state,
        expectedClassificationId
      );

      expect(classification).toMatchObject({
        ...fieldClassification.predictions[0],
        fieldName: fieldClassification.name,
      });
    });

    it('should return undefined when not found', () => {
      const classification = getClassificationById(state, 'unknown id');

      expect(classification).toBeUndefined();
    });
  });

  describe('getDocumentSuggestionById', () => {
    const suggestionId = 'some document unique id';

    const buildDocumentSuggestion = (suggestionId: string) => {
      return {
        clickUri: '',
        excerpt: '',
        fields: {},
        hasHtmlVersion: false,
        title: 'some document',
        uniqueId: suggestionId,
      };
    };

    it('should return the suggestion from the state', () => {
      const expectedDocument = buildDocumentSuggestion(suggestionId);
      state.documentSuggestions.documents.push(expectedDocument);

      const documentSuggestion = getDocumentSuggestionById(state, suggestionId);

      expect(documentSuggestion?.position).toBe(1);
      expect(documentSuggestion?.document).toEqual(expectedDocument);
    });

    it('should return the suggestion position', () => {
      state.documentSuggestions.documents.push(
        buildDocumentSuggestion('first')
      );
      state.documentSuggestions.documents.push(
        buildDocumentSuggestion(suggestionId)
      );
      state.documentSuggestions.documents.push(
        buildDocumentSuggestion('third')
      );

      const documentSuggestion = getDocumentSuggestionById(state, suggestionId);

      expect(documentSuggestion?.position).toBe(2);
      expect(documentSuggestion?.document.uniqueId).toBe(suggestionId);
    });

    it('should return undefined when not found', () => {
      const documentSuggestion = getDocumentSuggestionById(state, suggestionId);

      expect(documentSuggestion).toBeUndefined();
    });
  });
});
