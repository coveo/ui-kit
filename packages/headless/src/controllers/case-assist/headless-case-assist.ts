import {Engine} from '../../app/headless-engine';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseAssistId,
  setCaseInformationValue,
  setDebug,
  setUserContextValue,
} from '../../features/case-assist/case-assist-actions';
import {
  initializeTicketLogging,
  logTicketCancelled,
  logTicketClassificationClick,
  logTicketCreated,
  logTicketCreateStart,
  logTicketDocumentSuggestionClick,
  logTicketDocumentSuggestionRating,
  logTicketFieldUpdated,
  logTicketNextStage,
  logTicketSolved,
} from '../../features/case-assist/case-assist-analytics-actions';
import {CaseAssistState} from '../../features/case-assist/case-assist-state';
import {
  CaseAssistSection,
  ConfigurationSection,
} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * Provides methods for interacting with the Case Assist.
 */
export interface CaseAssist extends Controller {
  /**
   * Sets the ID of the Case Assist configuration to use.
   * Note: This must be set before calling `getClassifications` or `getDocumentSuggestions`.
   *
   * @param id The ID of the Case Assist configuration.
   */
  setCaseAssistId(id: string): void;

  /**
   * Sets a case information value in the state. Case information values are used by
   * Coveo Relevance Platform to retrieve relevant field classifications and document suggestions.
   *
   * @param fieldName - The name of the field that has been modified (e.g., the `subject` field).
   * @param fieldValue - The actual field value.
   */
  setCaseInformationValue(fieldName: string, fieldValue: string): void;

  /**
   * Sets a user context value in the state. User context values are used by
   * Coveo Relevance Platform to return relevant document suggestions.
   *
   * @param key - The context key.
   * @param value - The context value.
   */
  setUserContextValue(key: string, value: string): void;

  /**
   * Sets whether to retrieve debug information when getting suggestions.
   *
   * @param debug Whether to retrieve debug information.
   */
  setDebug(debug: boolean): void;

  /**
   * Gets the field classifications for the given Case Assist configuration.
   * Field classifications depend on the current case information.
   */
  getClassifications(): void;

  /**
   * Gets the document suggestions for the given Case Assist configuration.
   * Document suggestions depend on the current case information, and user context.
   */
  getDocumentSuggestions(): void;

  /**
   * Initializes the logger for the ticket-related Usage Analytics events.
   * This method must be invoked before any other ticket logging method.
   */
  initializeTicketLogging(): void;

  /**
   * Logs a `ticket_create_start` event. This method is usually invoked when
   * the user enters the case creation form.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#enter-interface
   */
  logTicketCreateStart(): void;

  /**
   * Logs a `ticket_field_update` event. This method is usually invoked each
   * time a user modifies the case information.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#fill-a-field
   *
   * @param fieldName - The name of the modified field.
   */
  logTicketFieldUpdated(fieldName: string): void;

  /**
   * Logs a `ticket_classification_click` event. This method is usually invoked
   * when the user confirms one of the suggested field classifications.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#select-a-case-classification
   *
   * @param predictionId - The ID of the field classification.
   */
  logTicketClassificationClick(predictionId: string): void;

  /**
   * Logs a `ticket_next_stage` event. This method should be invoked when
   * the user moves to the next page of your case creation flow.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#move-to-the-next-step
   */
  logTicketNextStage(): void;

  /**
   * Logs a `suggestion_click` event. This method is usually invoked when
   * the user clicks on a suggested document to consult it. It is a key
   * indicator for computing case deflection rate.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#select-a-document-suggestion
   *
   * @param suggestionId - The `uniqueId` of the suggested document.
   */
  logTicketDocumentSuggestionClick(suggestionId: string): void;

  /**
   * Logs a `suggestion_rate` event. This method should be invoked when the user
   * rates a document suggestion. The most common ways of rating document suggestions
   * are by using a 5 stars rating, or helpful/not helpful buttons.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#rate-a-document-suggestion
   *
   * @param suggestionId - The `uniqueId` of the suggested document.
   * @param rating - The rating value as a floating point number where `0.0` means
   * "not relevant", and `1.0` means "highly relevant".
   */
  logTicketDocumentSuggestionRating(suggestionId: string, rating: number): void;

  /**
   * Logs a `ticket_cancel` event (with the `Solved` reason). This method should be invoked when the user
   * quits the case creation form because he found an appropriate solution.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#cancel-a-ticket
   */
  logTicketSolved(): void;

  /**
   * Logs a `ticket_cancel` event (with the `Quit` reason). This method should be invoked when the user
   * quits the case creation form, but an appropriate solution might not have been suggested.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#cancel-a-ticket
   */
  logTicketCancelled(): void;

  /**
   * Logs a `ticket_create` event. This method should be invoked when the user submits the
   * case to the CRM platform.
   *
   * See https://docs.coveo.com/en/3437/service/log-case-assist-events#submit-a-ticket
   * @param ticketId - The ID of the created case.
   */
  logTicketCreated(ticketId: string): void;

  /**
   * The state of the `CaseAssist` controller.
   */
  state: CaseAssistState;
}

/**
 * Builds an instance of the Case Assist controller.
 *
 * @param engine - The headless engine the controller will use.
 * @returns - The newly created Case Assist controller.
 */
export function buildCaseAssist(
  engine: Engine<CaseAssistSection & ConfigurationSection>
): CaseAssist {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      const state = engine.state;

      return {
        ...state.caseAssist,
      };
    },

    setCaseAssistId(id) {
      dispatch(setCaseAssistId({id}));
    },
    setCaseInformationValue(fieldName, fieldValue) {
      dispatch(setCaseInformationValue({fieldName, fieldValue}));
    },
    setUserContextValue(key, value) {
      dispatch(setUserContextValue({key, value}));
    },
    setDebug(debug) {
      dispatch(setDebug({debug}));
    },
    getClassifications() {
      dispatch(getClassifications());
    },
    getDocumentSuggestions() {
      dispatch(getDocumentSuggestions());
    },
    initializeTicketLogging() {
      dispatch(initializeTicketLogging());
    },
    logTicketCreateStart() {
      dispatch(logTicketCreateStart());
    },
    logTicketFieldUpdated(fieldName: string) {
      dispatch(logTicketFieldUpdated({fieldName}));
    },
    logTicketClassificationClick(predictionId: string) {
      dispatch(logTicketClassificationClick({predictionId}));
    },
    logTicketNextStage() {
      dispatch(logTicketNextStage());
    },
    logTicketDocumentSuggestionClick(suggestionId: string) {
      dispatch(logTicketDocumentSuggestionClick({suggestionId}));
    },
    logTicketDocumentSuggestionRating(suggestionId: string, rating: number) {
      dispatch(logTicketDocumentSuggestionRating({suggestionId, rating}));
    },
    logTicketSolved() {
      dispatch(logTicketSolved());
    },
    logTicketCancelled() {
      dispatch(logTicketCancelled());
    },
    logTicketCreated(ticketId: string) {
      dispatch(logTicketCreated({ticketId}));
    },
  };
}
