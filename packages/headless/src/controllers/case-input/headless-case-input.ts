import {setCaseInput} from '../../features/case-inputs/case-inputs-actions';
import {fetchCaseClassifications} from '../../features/case-fields/case-fields-actions';
import {logCaseFieldUpdate} from '../../features/case-inputs/case-inputs-analytics-actions';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {
  CaseAssistConfigurationSection,
  CaseInputsSection,
  ConfigurationSection,
} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {caseInputs, configuration} from '../../app/reducers';
import {Schema, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';
import {loadReducerError} from '../../utils/errors';

export interface CaseInputOptions {
  field: string;
}

export interface CaseInputProps {
  options: CaseInputOptions;
}

function validateCaseInputOptions(
  engine: CaseAssistEngine<
    ConfigurationSection & CaseAssistConfigurationSection & CaseInputsSection
  >,
  options: Partial<CaseInputOptions> | undefined
) {
  const schema = new Schema<CaseInputOptions>({
    field: new StringValue({
      required: true,
      emptyAllowed: false,
    }),
  });
  validateOptions(engine, schema, options, 'buildCaseInput');
}

/**
 * The `CaseInput` controller is responsible for setting and retrieving the value of a single field from the case creation form.
 * This controller should be used for case information free-text fields.
 */
export interface CaseInput extends Controller {
  /**
   * Sets the value of the specified field.
   *
   * @param value - The case input value to set.
   */
  set(value: string): void;
  /**
   * A scoped and simplified part of the headless state that is relevant to the `CaseInput` controller.
   * */
  state: CaseInputState;
}

export interface CaseInputState {
  /**
   * The value of the case input.
   */
  value: string;
}

/**
 * Creates a `Case Input` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CaseInput` controller properties.
 * @returns A `CaseInput` controller instance.
 */
export function buildCaseInput(
  engine: CaseAssistEngine,
  props: CaseInputProps
): CaseInput {
  if (!loadCaseInputReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  validateCaseInputOptions(engine, props.options);

  const fieldName = props.options.field;

  return {
    ...controller,

    set(value: string) {
      dispatch(
        setCaseInput({
          fieldName: fieldName,
          fieldValue: value,
        })
      );
      dispatch(logCaseFieldUpdate());
      dispatch(fetchCaseClassifications());
      dispatch(fetchDocumentSuggestions());
    },

    get state() {
      return getState().caseInputs[fieldName];
    },
  };
}

/**
 * Creates a `Case Input` controller instance for a case subject.
 *
 * @param engine - The headless engine.
 * @returns A `CaseInput` controller instance.
 */
export function buildSubjectInput(engine: CaseAssistEngine): CaseInput {
  const fieldName = 'subject';

  return buildCaseInput(engine, {
    options: {
      field: fieldName,
    },
  });
}

/**
 * Creates a `Case Input` controller instance for a case description.
 *
 * @param engine - The headless engine.
 * @returns A `CaseInput` controller instance.
 */
export function buildDescriptionInput(engine: CaseAssistEngine): CaseInput {
  const fieldName = 'description';

  return buildCaseInput(engine, {
    options: {
      field: fieldName,
    },
  });
}

function loadCaseInputReducers(
  engine: CaseAssistEngine
): engine is CaseAssistEngine<
  ConfigurationSection & CaseAssistConfigurationSection & CaseInputsSection
> {
  engine.addReducers({configuration, caseInputs});
  return true;
}
