// import { BooleanValue, Schema, StringValue } from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseAssistId,
  setCaseInformationValue,
  setUserContextValue,
} from '../../features/case-assist/case-assist-actions';
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
  getClassifications(): void;
  getDocumentSuggestions(): void;

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
    getClassifications() {
      dispatch(getClassifications());
    },
    getDocumentSuggestions() {
      dispatch(getDocumentSuggestions());
    },
  };
}
