import {configuration} from '../../app/common-reducers.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {getDocumentSuggestionInitialState} from '../../features/document-suggestion/document-suggestion-state.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {
  buildMockCaseAssistEngine,
  type MockedCaseAssistEngine,
} from '../../test/mock-engine-v2.js';
import {
  buildDocumentSuggestionList,
  type DocumentSuggestionList,
} from './headless-document-suggestion-list.js';

vi.mock('../../features/document-suggestion/document-suggestion-actions');

describe('DocumentSuggestionList', () => {
  let engine: MockedCaseAssistEngine;
  let docSuggestionList: DocumentSuggestionList;

  function initDocumentSuggestion() {
    docSuggestionList = buildDocumentSuggestionList(engine);
  }

  function initEngine(preloadedState = buildMockCaseAssistState()) {
    engine = buildMockCaseAssistEngine(preloadedState);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    initEngine();
    initDocumentSuggestion();
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

  it('state returns correct initial state', () => {
    const initialState = getDocumentSuggestionInitialState();
    expect(docSuggestionList.state).toEqual({
      loading: initialState.status.loading,
      error: initialState.status.error,
      documents: initialState.documents,
    });
  });

  describe('#fetch', () => {
    it('dispatches a #fetchDocumentSuggestions', () => {
      const mockedFetchDocumentSuggestions = vi.mocked(
        fetchDocumentSuggestions
      );

      docSuggestionList.fetch();

      expect(mockedFetchDocumentSuggestions).toHaveBeenCalled();
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedFetchDocumentSuggestions.mock.results[0].value
      );
    });
  });
});
