import {configuration} from '../../app/common-reducers.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {logUpdateCaseField} from '../../features/case-assist/case-assist-analytics-actions.js';
import {fetchCaseClassifications} from '../../features/case-field/case-field-actions.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {updateCaseInput} from '../../features/case-input/case-input-actions.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {
  buildMockCaseAssistEngine,
  MockedCaseAssistEngine,
} from '../../test/mock-engine-v2.js';
import {
  CaseInput,
  CaseInputOptions,
  buildCaseInput,
} from './headless-case-input.js';

jest.mock('../../features/case-input/case-input-actions');
jest.mock('../../features/case-assist/case-assist-analytics-actions');
jest.mock('../../features/case-field/case-field-actions');
jest.mock('../../features/document-suggestion/document-suggestion-actions');

describe('Case Input', () => {
  let engine: MockedCaseAssistEngine;
  let options: CaseInputOptions;
  let input: CaseInput;

  const testFieldName = 'testfield';

  function initCaseInput() {
    input = buildCaseInput(engine, {options});
  }

  function initEngine(preloadedState = buildMockCaseAssistState()) {
    engine = buildMockCaseAssistEngine(preloadedState);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    options = {
      field: testFieldName,
    };
    initEngine();
    initCaseInput();
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

  it('dispatch #updateCaseInput on init if the field was not already registered', () => {
    const mockedUpdateCaseInput = jest.mocked(updateCaseInput);

    expect(mockedUpdateCaseInput).toHaveBeenCalledWith({
      fieldName: testFieldName,
      fieldValue: '',
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedUpdateCaseInput.mock.results[0].value
    );
  });

  it('do not dispatch #updateCaseInput on init if the field was already registered', () => {
    jest.resetAllMocks();
    const mockedUpdateCaseInput = jest.mocked(updateCaseInput);
    initEngine({
      ...buildMockCaseAssistState(),
      caseInput: {
        [testFieldName]: {
          value: '',
        },
      },
    });

    initCaseInput();

    expect(mockedUpdateCaseInput).not.toHaveBeenCalled();
  });

  it('building a case input specifying an empty field name throws', () => {
    options.field = '';
    expect(() => initCaseInput()).toThrow(
      'Check the options of buildCaseInput'
    );
  });

  describe('#update', () => {
    const testValue = 'test input value';

    it('dispatches a #updateCaseInput action with the passed input value', () => {
      jest.resetAllMocks();
      const mockedUpdateCaseInput = jest.mocked(updateCaseInput);

      input.update(testValue);

      expect(mockedUpdateCaseInput).toHaveBeenCalledWith({
        fieldName: testFieldName,
        fieldValue: testValue,
      });
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedUpdateCaseInput.mock.results[0].value
      );
    });

    it('dispatches a #logUpdateCaseField analytics action', () => {
      const mockedlogUpdateCaseField = jest.mocked(logUpdateCaseField);

      input.update(testValue);

      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedlogUpdateCaseField.mock.results[0].value
      );
    });

    it('dispatches a #fetchCaseClassifications action when required', () => {
      const mockedFetchCaseClassifications = jest.mocked(
        fetchCaseClassifications
      );

      input.update(testValue, {
        caseClassifications: true,
      });

      expect(mockedFetchCaseClassifications).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchCaseClassifications.mock.results[0].value
      );
    });

    it('dispatches a #fetchDocumentSuggestions action when required', () => {
      const mockedFetchDocumentSuggestions = jest.mocked(
        fetchDocumentSuggestions
      );

      input.update(testValue, {
        documentSuggestions: true,
      });

      expect(mockedFetchDocumentSuggestions).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchDocumentSuggestions.mock.results[0].value
      );
    });

    it('dispatches both #fetchCaseClassifications and #fetchDocumentSuggestions when required', () => {
      const mockedFetchCaseClassifications = jest.mocked(
        fetchCaseClassifications
      );
      const mockedFetchDocumentSuggestions = jest.mocked(
        fetchDocumentSuggestions
      );

      input.update(testValue, {
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
      const mockedFetchCaseClassifications = jest.mocked(
        fetchCaseClassifications
      );
      const mockedFetchDocumentSuggestions = jest.mocked(
        fetchDocumentSuggestions
      );

      input.update(testValue);

      expect(mockedFetchDocumentSuggestions).not.toHaveBeenCalled();
      expect(mockedFetchCaseClassifications).not.toHaveBeenCalled();
    });
  });
});
