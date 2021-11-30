import {Schema} from '@coveo/bueno';
import {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {
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
  loading: boolean;
  error: CaseAssistAPIErrorStatusResponse | null;
  value: string;
  suggestions: CaseFieldSuggestion[];
}

export interface CaseField extends Controller {
  update(value: string, updatesToFetch?: UpdateCaseFieldFetchOptions): void;

  state: CaseFieldState;
}

export interface UpdateCaseFieldFetchOptions {
  caseClassifications?: boolean;
  documentSuggestions?: boolean;
}

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

  dispatch(
    registerCaseField({
      fieldName: options.field,
      fieldValue: '',
    })
  );

  const getState = () => {
    return engine.state;
  };

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
  engine.addReducers({configuration, caseInput, caseField, documentSuggestion});
  return true;
}
