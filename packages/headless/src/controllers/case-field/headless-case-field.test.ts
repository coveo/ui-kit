import {configuration} from '../../app/common-reducers.js';
import {
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
import {getCaseFieldInitialState} from '../../features/case-field/case-field-state.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {
  buildMockCaseAssistEngine,
  type MockedCaseAssistEngine,
} from '../../test/mock-engine-v2.js';
import {
  buildCaseField,
  type CaseField,
  type CaseFieldOptions,
} from './headless-case-field.js';

vi.mock('../../features/document-suggestion/document-suggestion-actions');
vi.mock('../../features/case-field/case-field-actions');
vi.mock('../../features/case-assist/case-assist-analytics-actions');

describe('Case Field', () => {
  let engine: MockedCaseAssistEngine;
  let options: CaseFieldOptions;
  let field: CaseField;

  const testFieldName = 'testField';

  function initCaseField() {
    field = buildCaseField(engine, {options});
  }

  function initEngine(preloadedState = buildMockCaseAssistState()) {
    engine = buildMockCaseAssistEngine(preloadedState);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      field: testFieldName,
    };
    initEngine();
    initCaseField();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      caseAssistConfiguration,
      caseInput,
      caseField,
      documentSuggestion,
    });
  });

  it('dispatch #registerCaseField on init if the field was not already registered', () => {
    const mockedRegisterCaseField = vi.mocked(registerCaseField);

    initCaseField();

    expect(mockedRegisterCaseField).toHaveBeenCalledWith({
      fieldName: testFieldName,
      fieldValue: '',
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedRegisterCaseField.mock.results[0].value
    );
  });

  it('does not dispatch #registerCaseField on init if the field is already registered', () => {
    vi.resetAllMocks();
    const mockedRegisterCaseField = vi.mocked(registerCaseField);

    const initialState = buildMockCaseAssistState();
    initialState.caseField.fields[testFieldName] = {suggestions: [], value: ''};
    initEngine(initialState);

    initCaseField();

    expect(mockedRegisterCaseField).not.toHaveBeenCalled();
    expect(engine.dispatch).not.toHaveBeenCalled();
  });

  describe('#update', () => {
    const testValue = 'test case field value';

    beforeEach(() => {
      engine.state = {
        ...engine.state,
        caseField: {
          ...getCaseFieldInitialState(),
          fields: {
            [testFieldName]: {
              value: '',
              suggestions: [
                {
                  id: 'some-suggestion-id',
                  confidence: 0.987,
                  value: 'suggested value',
                },
              ],
            },
          },
        },
      };
    });

    it('dispatches a #logClassificationClick action when value is a suggestion', () => {
      const mockedLogClassificationClick = vi.mocked(logClassificationClick);

      field.update('suggested value');

      expect(mockedLogClassificationClick).toHaveBeenCalledWith(
        'some-suggestion-id'
      );
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedLogClassificationClick.mock.results[0].value
      );
    });

    it('does not dispatch a #logClassificationClick action when value is not a suggestion', () => {
      const mockedLogClassificationClick = vi.mocked(logClassificationClick);

      field.update(testValue);

      expect(mockedLogClassificationClick).not.toHaveBeenCalled();
    });

    it('dispatches a #updateCaseField action with the passed field value', () => {
      const mockedUpdateCaseField = vi.mocked(updateCaseField);

      field.update(testValue);

      expect(mockedUpdateCaseField).toHaveBeenCalledWith({
        fieldName: testFieldName,
        fieldValue: testValue,
      });
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedUpdateCaseField.mock.results[0].value
      );
    });

    it('dispatches a #logUpdateCaseField analytics action', () => {
      const mockedLogUpdateCaseField = vi.mocked(logUpdateCaseField);

      field.update(testValue);

      expect(mockedLogUpdateCaseField).toHaveBeenCalledWith(testFieldName);
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedLogUpdateCaseField.mock.results[0].value
      );
    });

    it('does not dispatch a #logCaseFieldUpdate analytics action when the autoSelection parameter is set to true', () => {
      const mockedLogUpdateCaseField = vi.mocked(logUpdateCaseField);

      field.update(testValue, undefined, true);

      expect(mockedLogUpdateCaseField).not.toHaveBeenCalled();
    });

    it('dispatches a #fetchCaseClassifications action when required', () => {
      const mockedFetchCaseClassifications = vi.mocked(
        fetchCaseClassifications
      );

      field.update(testValue, {
        caseClassifications: true,
      });

      expect(mockedFetchCaseClassifications).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchCaseClassifications.mock.results[0].value
      );
    });

    it('dispatches a #fetchDocumentSuggestions action when required', () => {
      const mockedFetchDocumentSuggestions = vi.mocked(
        fetchDocumentSuggestions
      );

      field.update(testValue, {
        documentSuggestions: true,
      });

      expect(mockedFetchDocumentSuggestions).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchDocumentSuggestions.mock.results[0].value
      );
    });

    it('dispatches both #fetchCaseClassifications and #fetchDocumentSuggestions when required', () => {
      const mockedFetchCaseClassifications = vi.mocked(
        fetchCaseClassifications
      );
      const mockedFetchDocumentSuggestions = vi.mocked(
        fetchDocumentSuggestions
      );

      field.update(testValue, {
        caseClassifications: true,
        documentSuggestions: true,
      });

      expect(mockedFetchDocumentSuggestions).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchDocumentSuggestions.mock.results[0].value
      );
      expect(mockedFetchCaseClassifications).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchCaseClassifications.mock.results[0].value
      );
    });

    it('does not dispatch #fetchCaseClassifications nor #fetchDocumentSuggestions when not required', () => {
      const mockedFetchCaseClassifications = vi.mocked(
        fetchCaseClassifications
      );
      const mockedFetchDocumentSuggestions = vi.mocked(
        fetchDocumentSuggestions
      );

      field.update(testValue);

      expect(mockedFetchDocumentSuggestions).not.toHaveBeenCalled();
      expect(mockedFetchCaseClassifications).not.toHaveBeenCalled();
    });
  });
});
