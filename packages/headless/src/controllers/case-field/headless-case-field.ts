import {Schema} from '@coveo/bueno';
import {CaseAssistEngine, loadCaseFieldActions} from '../../case-assist.index';
import {
  logClassificationClick,
  logUpdateCaseField,
} from '../../features/case-assist/case-assist-analytics-actions';
import {
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from '../../features/case-field/case-field-actions';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';
import {loadReducerError} from '../../utils/errors';
import {nonEmptyString, validateOptions} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

export interface CaseFieldProps {
  options?: CaseFieldOptions;
}

const optionsSchema = new Schema({
  fieldName: nonEmptyString,
});

export interface CaseFieldOptions {
  fieldName: string;
}

export interface CaseField extends Controller {
  set(value: string): void;
}

export function buildCaseField(
  engine: CaseAssistEngine,
  props: CaseFieldProps = {}
): CaseField {
  if (!loadCaseFieldActions(engine)) {
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
      fieldName: options.fieldName,
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

      const field = getState().caseField?.fields?.[options.fieldName];
      const value = field?.value ?? '';
      const suggestions = field?.suggestions ?? [];

      return {
        loading,
        error,
        value,
        suggestions,
      };
    },

    set(
      value: string,
      shouldFetchDocumentSuggestions = false,
      shouldFetchCaseClassifications = false
    ) {
      const suggestionId = getState().caseField?.fields?.[
        options.fieldName
      ]?.suggestions?.find((s) => s.value === value)?.id;

      if (suggestionId) {
        dispatch(logClassificationClick(suggestionId));
      }

      dispatch(
        updateCaseField({
          fieldName: options.fieldName,
          fieldValue: value,
        })
      );

      dispatch(logUpdateCaseField(options.fieldName));

      if (shouldFetchDocumentSuggestions) {
        dispatch(fetchDocumentSuggestions());
      }
      if (shouldFetchCaseClassifications) {
        dispatch(fetchCaseClassifications());
      }
    },
  };
}
