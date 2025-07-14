import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import type {CaseAssistAction} from '../analytics/analytics-utils.js';
import {
  logAbandonCase,
  logCaseNextStage,
  logCaseStart,
  logClassificationClick,
  logCreateCase,
  logDocumentSuggestionClick,
  logDocumentSuggestionRating,
  logQuickviewDocumentSuggestionClick,
  logSolveCase,
  logUpdateCaseField,
} from './case-assist-analytics-actions.js';

export interface NextStageOptions {
  stageName?: string;
}

/**
 * The Case Assist analytics action creators.
 *
 * @group Actions
 * @category Analytics
 */
export interface CaseAssistAnalyticsActionCreators {
  /**
   * Creates a Case Assist event for when the user enters the interface.
   *
   * @returns A dispatchable action.
   */
  logCaseStart(): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user moves to the next stage.
   *
   * @param options - Options of the event.
   * @returns A dispatchable action.
   */
  logCaseNextStage(options?: NextStageOptions): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user creates a case.
   *
   * @returns A dispatchable action.
   */
  logCreateCase(): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the case is solved.
   *
   * @returns A dispatchable action.
   */
  logSolveCase(): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user leaves.
   *
   * @returns A dispatchable action.
   */
  logAbandonCase(): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user updates a field.
   *
   * @param fieldName - The target field name.
   * @returns A dispatchable action.
   */
  logUpdateCaseField(fieldName: string): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user selects a classification suggestion.
   *
   * @param classificationId - The unique identifier of the target classification.
   * @returns A dispatchable action.
   */
  logClassificationClick(classificationId: string): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user selects a document suggestion.
   *
   * @param suggestionId - The unique identifier of the target document.
   * @returns A dispatchable action.
   */
  logDocumentSuggestionClick(suggestionId: string): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user previews a document suggestion from the quickview.
   *
   * @param suggestionId - The unique identifier of the target document.
   * @returns A dispatchable action.
   */
  logQuickviewDocumentSuggestionClick(suggestionId: string): CaseAssistAction;

  /**
   * Creates a Case Assist event for when the user rates a document suggestion.
   *
   * @param suggestionId - The unique identifier of the target document.
   * @param rating - The rating.
   * @returns A dispatchable action.
   */
  logDocumentSuggestionRating(
    suggestionId: string,
    rating: number
  ): CaseAssistAction;
}

/**
 * Loads the case assist analytics actions.
 * @param engine The case assist engine.
 * @returns The available analytics actions.
 *
 * @group Actions
 * @category Analytics
 */
export function loadCaseAssistAnalyticsActions(
  engine: CaseAssistEngine
): CaseAssistAnalyticsActionCreators {
  engine.addReducers({});
  return {
    logCaseStart,
    logCaseNextStage,
    logCreateCase,
    logSolveCase,
    logAbandonCase,
    logUpdateCaseField,
    logClassificationClick,
    logDocumentSuggestionClick,
    logDocumentSuggestionRating,
    logQuickviewDocumentSuggestionClick,
  };
}
