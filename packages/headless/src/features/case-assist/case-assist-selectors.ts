import {Result} from '../../api/search/search/result';
import {CaseAssistState} from './case-assist-state';

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

export interface RankedResult {
  result: Result;
  position: number;
}

export const getDocumentSuggestionById = (
  state: CaseAssistState,
  suggestionId: string
): RankedResult | undefined => {
  return state.documentSuggestions.documents
    .map((document, index) => ({
      result: document,
      position: index + 1,
    }))
    .find((rankedResult) => rankedResult.result.uniqueId === suggestionId);
};
