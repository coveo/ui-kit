import {Schema} from '@coveo/bueno';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {configuration} from '../../app/common-reducers';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice';
import {logUpdateCaseField} from '../../features/case-assist/case-assist-analytics-actions';
import {fetchCaseClassifications} from '../../features/case-field/case-field-actions';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice';
import {updateCaseInput} from '../../features/case-input/case-input-actions';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice';
import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DocumentSuggestionSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  requiredNonEmptyString,
  validateOptions,
} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

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
    field: requiredNonEmptyString,
  });
  validateOptions(engine, schema, options, 'buildCaseInput');
}

export interface UpdateFetchOptions {
  caseClassifications?: boolean;
  documentSuggestions?: boolean;
}

/**
 * The `CaseInput` controller is responsible for setting and retrieving the value of a single field from the case creation form and optionally trigger Case Assist API requests.
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
  const isRegistered = getState().caseInput?.[fieldName];

  if (!isRegistered) {
    dispatch(
      updateCaseInput({
        fieldName: fieldName,
        fieldValue: '',
      })
    );
  }

  return {
    ...controller,

    update(
      value: string,
      updatesToFetch?: {
        caseClassifications?: boolean;
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

      updatesToFetch?.caseClassifications &&
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
  engine.addReducers({
    configuration,
    caseAssistConfiguration,
    caseInput,
    caseField,
    documentSuggestion,
  });
  return true;
}
