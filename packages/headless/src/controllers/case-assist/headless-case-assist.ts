import {Engine} from '../../app/headless-engine';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseInformationValue,
} from '../../features/case-assist/case-assist-actions';
import {CaseAssistState} from '../../features/case-assist/case-assist-state';
import {
  CaseAssistSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * Provides methods for interacting with the Case Assist.
 */
export interface CaseAssist extends Controller {
  /**
   * Sets a case information value in the state. Case information values are used by
   * Coveo Relevance Platform to retrieve relevant field classifications and document suggestions.
   *
   * @param fieldName - The name of the field that has been modified (e.g., the `subject` field).
   * @param fieldValue - The actual field value.
   */
  setCaseInformationValue(fieldName: string, fieldValue: string): void;

  /**
   * Gets the field classifications for the given Case Assist configuration.
   * Field classifications depend on the current case information.
   */
  getClassifications(): void;

  /**
   * Gets the document suggestions for the given Case Assist configuration.
   * Document suggestions depend on the current case information, and context.
   */
  getDocumentSuggestions(): void;

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
  engine: Engine<
    CaseAssistSection & ConfigurationSection & ContextSection & DebugSection
  >
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

    setCaseInformationValue(fieldName, fieldValue) {
      dispatch(setCaseInformationValue({fieldName, fieldValue}));
    },
    getClassifications() {
      dispatch(getClassifications());
    },
    getDocumentSuggestions() {
      dispatch(getDocumentSuggestions());
    },
  };
}
