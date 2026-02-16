import {Schema} from '@coveo/bueno';
import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {configuration} from '../../app/common-reducers.js';
import {logUpdateCaseField} from '../../features/case-assist/case-assist-analytics-actions.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {fetchCaseClassifications} from '../../features/case-field/case-field-actions.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {updateCaseInput} from '../../features/case-input/case-input-actions.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import type {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DocumentSuggestionSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  requiredNonEmptyString,
  validateOptions,
} from '../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

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
 *
 * For example implementations, see the following [Coveo Quantic Case Assist components](https://docs.coveo.com/en/quantic/latest/reference/case-assist-components/):
 * * [quanticCaseClassification.js](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticCaseClassification/quanticCaseClassification.js)
 * * [quanticDocumentSuggestion](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticDocumentSuggestion/quanticDocumentSuggestion.js)
 *
 * @group Controllers
 * @category CaseInput
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

/**
 * A scoped and simplified part of the headless state that is relevant to the `CaseInput` controller.
 *
 * @group Controllers
 * @category CaseInput
 */
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
 *
 * @group Controllers
 * @category CaseInput
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
