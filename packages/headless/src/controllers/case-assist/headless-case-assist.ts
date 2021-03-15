// import { BooleanValue, Schema, StringValue } from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {updateClassifications} from '../../features/case-assist/case-assist-actions';
import {
  CaseAssistSection,
  ConfigurationSection,
} from '../../state/state-sections';
// import { validateOptions } from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

export interface ServiceApiState {
  classifications: {[field: string]: string[]};
}

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
  updateClassifications(fields: {[key: string]: string}): void;

  /**
   * The state of the `ServiceApi` controller.
   */
  state: ServiceApiState;
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

    updateClassifications(fields) {
      dispatch(updateClassifications(fields));
    },
  };
}
