import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByCaseAssistAnalytics} from '../../api/analytics/analytics';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {AsyncThunkAnalyticsOptions} from '../analytics/analytics-utils';
import {
  logAbandonCase,
  logCaseNextStage,
  logCaseStart,
  logClassificationClick,
  logCreateCase,
  logDocumentSuggestionClick,
  logDocumentSuggestionRating,
  logSolveCase,
  logUpdateCaseField,
  logQuickviewDocumentSuggestionClick,
} from './case-assist-analytics-actions';

/**
 * The Case Assist analytics action creators.
 */
export interface CaseAssistAnalyticsActionCreators {
  /**
   * Creates a Case Assist event for when the user enters the interface.
   *
   * @returns A dispatchable action.
   */
  logCaseStart(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user moves to the next stage.
   *
   * @returns A dispatchable action.
   */
  logCaseNextStage(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user creates a case.
   *
   * @returns A dispatchable action.
   */
  logCreateCase(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the case is solved.
   *
   * @returns A dispatchable action.
   */
  logSolveCase(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user leaves.
   *
   * @returns A dispatchable action.
   */
  logAbandonCase(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user updates a field.
   *
   * @param fieldName - The target field name.
   * @returns A dispatchable action.
   */
  logUpdateCaseField(
    fieldName: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user selects a classification suggestion.
   *
   * @param classificationId - The unique identifier of the target classification.
   * @returns A dispatchable action.
   */
  logClassificationClick(
    classificationId: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user selects a document suggestion.
   *
   * @param suggestionId - The unique identifier of the target document.
   * @returns A dispatchable action.
   */
  logDocumentSuggestionClick(
    suggestionId: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  /**
   * Creates a Case Assist event for when the user previews a document suggestion from the quickview.
   *
   * @param suggestionId - The unique identifier of the target document.
   * @returns A dispatchable action.
   */
  logQuickviewDocumentSuggestionClick(
    suggestionId: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

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
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;
}

/**
 * Loads the case assist analytics actions.
 * @param engine The case assist engine.
 * @returns The available analytics actions.
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
