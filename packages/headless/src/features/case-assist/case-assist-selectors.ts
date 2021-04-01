import {CaseAssistState} from './case-assist-state';
import {Result} from '../../api/service/service-api-client';

export interface FieldClassification {
  fieldName: string;
  id: string;
  value: string;
  confidence: number;
}

/**
 * Gets the specified field classification from the state.
 *
 * @param state - The current state.
 * @param predictionId - The field classification ID.
 * @returns - The field classification, or `undefined` when not found.
 */
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

/**
 * Gets the specified document suggestion from the state.
 *
 * @param state - The current state.
 * @param suggestionId - The `uniqueId` of the suggested document.
 * @returns - The document suggestion with its 1-based position in the suggested documents list, or undefined when not found.
 */
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
