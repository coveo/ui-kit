// import { BooleanValue, Schema, StringValue } from '@coveo/bueno';
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
  logTicketDocumentSuggestionDownvote,
  logTicketDocumentSuggestionUpvote,
  logTicketFieldUpdated,
  logTicketNextStage,
  logTicketSolved,
} from '../../features/case-assist/case-assist-analytics-actions';
import {CaseAssistState} from '../../features/case-assist/case-assist-state';
import {
  CaseAssistSection,
  ConfigurationSection,
} from '../../state/state-sections';
// import { validateOptions } from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

export interface ServiceApiOptions {
  caseAssistId?: string;
  visitorId?: string;
  debug?: boolean;
}

export interface ServiceApiProps {
  options?: ServiceApiOptions;
}

/*
const optionsSchema = new Schema({
    caseAssistId: new StringValue({ default: '' }),
    visitorId: new StringValue({ default: '' }),
    debug: new BooleanValue({ default: false })
});
*/

export interface CaseAssist extends Controller {
  setCaseAssistId(id: string): void;
  setCaseInformationValue(fieldName: string, fieldValue: string): void;
  setUserContextValue(key: string, value: string): void;
  setDebug(debug: boolean): void;
  getClassifications(): void;
  getDocumentSuggestions(): void;

  initializeTicketLogging(): void;
  logTicketCreateStart(): void;
  logTicketFieldUpdated(fieldName: string): void;
  logTicketClassificationClick(predictionId: string): void;
  logTicketNextStage(): void;
  logTicketDocumentSuggestionClick(suggestionId: string): void;
  logTicketDocumentSuggestionUpvote(suggestionId: string): void;
  logTicketDocumentSuggestionDownvote(suggestionId: string): void;
  logTicketSolved(): void;
  logTicketCancelled(): void;
  logTicketCreated(ticketId: string): void;

  /**
   * The state of the `CaseAssist` controller.
   */
  state: CaseAssistState;
}

export function buildCaseAssist(
  engine: Engine<CaseAssistSection & ConfigurationSection>
  /* props?: ServiceApiProps */
): CaseAssist {
  const controller = buildController(engine);
  const {dispatch} = engine;

  // TODO: Validate controller options
  /* const options = validateOptions(
        engine,
        optionsSchema,
        props?.options,
        'buildServiceApi'
    ) as Required<ServiceApiOptions>;*/

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
    logTicketDocumentSuggestionUpvote(suggestionId: string) {
      dispatch(logTicketDocumentSuggestionUpvote({suggestionId}));
    },
    logTicketDocumentSuggestionDownvote(suggestionId: string) {
      dispatch(logTicketDocumentSuggestionDownvote({suggestionId}));
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
