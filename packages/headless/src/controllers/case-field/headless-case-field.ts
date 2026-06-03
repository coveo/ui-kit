import {Schema} from '@coveo/bueno';
import type {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client.js';
import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {configuration} from '../../app/common-reducers.js';
import {
  logAutoSelectCaseField,
  logClassificationClick,
  logUpdateCaseField,
} from '../../features/case-assist/case-assist-analytics-actions.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from '../../features/case-field/case-field-actions.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import type {CaseFieldSuggestion} from '../../features/case-field/case-field-state.js';
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

export interface CaseFieldProps {
  options?: CaseFieldOptions;
}

const optionsSchema = new Schema({
  field: requiredNonEmptyString,
});

export interface CaseFieldOptions {
  field: string;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CaseField` controller.
 *
 * @group Controllers
 * @category CaseField
 */
export interface CaseFieldState {
  /**
   * Whether suggestions are being retrieved for the field.
   */
  loading: boolean;
  /**
   * The error that occurred while fetching suggestions, if any.
   */
  error: CaseAssistAPIErrorStatusResponse | null;
  /**
   * The current field value.
   */
  value: string;
  /**
   * The field suggestions.
   */
  suggestions: CaseFieldSuggestion[];
}

/**
 * The `CaseField` controller is responsible for setting the value and retrieving suggestions for a field from the case creation form and optionally trigger Case Assist API requests.
 *
 * For example implementations, see the following [Coveo Quantic Case Assist components](https://docs.coveo.com/en/quantic/latest/reference/case-assist-components/):
 * * [quanticCaseClassification.js](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticCaseClassification/quanticCaseClassification.js)
 * * [quanticDocumentSuggestion](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticDocumentSuggestion/quanticDocumentSuggestion.js)
 *
 * @group Controllers
 * @category CaseField
 */
export interface CaseField extends Controller {
  /**
   * Sets the value of the specified field.
   *
   * @param value - The field value to set.
   * @param updatesToFetch - A set of flags dictating whether to fetch case assist data after updating the field value.
   * @param autoSelection - A flag indicating whether the update was triggered by an automatic selection.
   */
  update(
    value: string,
    updatesToFetch?: UpdateCaseFieldFetchOptions,
    autoSelection?: boolean
  ): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `CaseField` controller.
   */
  state: CaseFieldState;
}

export interface UpdateCaseFieldFetchOptions {
  caseClassifications?: boolean;
  documentSuggestions?: boolean;
}

/**
 * Creates a `CaseField` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CaseField` controller properties.
 * @returns A `CaseField` controller instance.
 *
 * @group Controllers
 * @category CaseField
 */
export function buildCaseField(
  engine: CaseAssistEngine,
  props: CaseFieldProps = {}
): CaseField {
  if (!loadCaseFieldReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildCaseField'
  ) as Required<CaseFieldOptions>;

  const getState = () => {
    return engine.state;
  };

  const isRegistered = getState().caseField?.fields?.[options.field];

  if (!isRegistered) {
    dispatch(
      registerCaseField({
        fieldName: options.field,
        fieldValue: '',
      })
    );
  }

  return {
    ...controller,

    get state() {
      const loading = getState().caseField?.status?.loading ?? false;
      const error = getState().caseField?.status?.error ?? null;

      const field = getState().caseField?.fields?.[options.field];
      const value = field?.value ?? '';
      const suggestions = field?.suggestions ?? [];

      return {
        loading,
        error,
        value,
        suggestions,
      };
    },

    update(
      value: string,
      updatesToFetch?: UpdateCaseFieldFetchOptions,
      autoSelection?: boolean
    ) {
      const suggestionId = getState().caseField?.fields?.[
        options.field
      ]?.suggestions?.find((s) => s.value === value)?.id;

      if (suggestionId) {
        autoSelection
          ? dispatch(logAutoSelectCaseField(suggestionId))
          : dispatch(logClassificationClick(suggestionId));
      }

      dispatch(
        updateCaseField({
          fieldName: options.field,
          fieldValue: value,
        })
      );

      !autoSelection && dispatch(logUpdateCaseField(options.field));

      updatesToFetch?.caseClassifications &&
        dispatch(fetchCaseClassifications());
      updatesToFetch?.documentSuggestions &&
        dispatch(fetchDocumentSuggestions());
    },
  };
}

function loadCaseFieldReducers(
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
