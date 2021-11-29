import {updateCaseInput} from '../../features/case-input/case-input-actions';
import {fetchCaseClassifications} from '../../features/case-field/case-field-actions';
import {logUpdateCaseField} from '../../features/case-assist/case-assist-analytics-actions';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DocumentSuggestionSection,
} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {
  caseField,
  caseInput,
  configuration,
  documentSuggestion,
} from '../../app/reducers';
import {Schema, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';
import {loadReducerError} from '../../utils/errors';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';

export interface CaseInputOptions {
  field: string;
}

export interface CaseInputProps {
  options: CaseInputOptions;
}

function validateCaseInputOptions(
  engine: CaseAssistEngine,
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

export interface UpdateFetchOptions {
  caseClassifications?: boolean;
  documentSuggestions?: boolean;
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
   * @param updatesToFetch - A set of flags dictating whether to fetch case assist data after updating the input value.
   */
  update(value: string, updatesToFetch?: UpdateFetchOptions): void;
  /**
   * A scoped and simplified part of the headless state that is relevant to the `CaseInput` controller.
   */
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

  dispatch(
    updateCaseInput({
      fieldName: fieldName,
      fieldValue: '',
    })
  );

  return {
    ...controller,

    update(
      value: string,
      updatesToFetch?: {
        caselassifications?: boolean;
        documentSuggestions?: boolean;
      }
    ) {
      dispatch(
        updateCaseInput({
          fieldName: fieldName,
          fieldValue: value,
        })
      );
      dispatch(logUpdateCaseField(fieldName));

      updatesToFetch?.caselassifications &&
        dispatch(fetchCaseClassifications());
      updatesToFetch?.documentSuggestions &&
        dispatch(fetchDocumentSuggestions());
    },

    get state() {
      return getState().caseInput[fieldName];
    },
  };
}

function loadCaseInputReducers(
  engine: CaseAssistEngine
): engine is CaseAssistEngine<
  ConfigurationSection &
    CaseAssistConfigurationSection &
    CaseInputSection &
    CaseFieldSection &
    DocumentSuggestionSection
> {
  engine.addReducers({configuration, caseInput, caseField, documentSuggestion});
  return true;
}
