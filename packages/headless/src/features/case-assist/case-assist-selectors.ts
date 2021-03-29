import {CaseAssistState} from './case-assist-state';
import {Result} from '../../api/service/service-api-client';

export interface FieldClassification {
  fieldName: string;
  id: string;
  value: string;
  confidence: number;
}

export const getClassificationById = (
  state: CaseAssistState,
  predictionId: string
): FieldClassification | undefined => {
  let result = undefined;

  state.classifications.fields.forEach((field) => {
    field.predictions.forEach((prediction) => {
      if (prediction.id === predictionId) {
        result = {
          fieldName: field.name,
          id: prediction.id,
          value: prediction.value,
          confidence: prediction.confidence,
        };
      }
    });
  });

  return result;
};

export interface RankedDocument {
  document: Result;
  position: number;
}

export const getDocumentSuggestionById = (
  state: CaseAssistState,
  suggestionId: string
): RankedDocument | undefined => {
  return state.documentSuggestions.documents
    .map((document, index) => ({
      document,
      position: index + 1,
    }))
    .find(
      (rankedDocument) => rankedDocument.document.uniqueId === suggestionId
    );
};
