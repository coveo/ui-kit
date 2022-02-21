import {Schema} from '@coveo/bueno';
import {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {
  caseAssistConfiguration,
  caseField,
  caseInput,
  configuration,
  documentSuggestion,
} from '../../app/reducers';
import {
  logClassificationClick,
  logUpdateCaseField,
} from '../../features/case-assist/case-assist-analytics-actions';
import {
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from '../../features/case-field/case-field-actions';
import {CaseFieldSuggestion} from '../../features/case-field/case-field-state';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';
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

export interface CaseFieldProps {
  options?: CaseFieldOptions;
}

const optionsSchema = new Schema({
  field: requiredNonEmptyString,
});

export interface CaseFieldOptions {
  field: string;
}

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
 */
export interface CaseField extends Controller {
  /**
   * Sets the value of the specified field.
   *
   * @param value - The field value to set.
   * @param updatesToFetch - A set of flags dictating whether to fetch case assist data after updating the field value.
   */
  update(value: string, updatesToFetch?: UpdateCaseFieldFetchOptions): void;

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

    update(value: string, updatesToFetch?: UpdateCaseFieldFetchOptions) {
      const suggestionId = getState().caseField?.fields?.[
        options.field
      ]?.suggestions?.find((s) => s.value === value)?.id;

      if (suggestionId) {
        dispatch(logClassificationClick(suggestionId));
      }

      dispatch(
        updateCaseField({
          fieldName: options.field,
          fieldValue: value,
        })
      );

      dispatch(logUpdateCaseField(options.field));

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
