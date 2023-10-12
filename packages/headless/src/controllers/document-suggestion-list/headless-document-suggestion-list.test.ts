import {configuration} from '../../app/common-reducers.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {getDocumentSuggestionInitialState} from '../../features/document-suggestion/document-suggestion-state.js';
import {
  buildMockCaseAssistEngine,
  MockCaseAssistEngine,
} from '../../test/mock-engine.js';
import {
  DocumentSuggestionList,
  buildDocumentSuggestionList,
} from './headless-document-suggestion-list.js';

describe('Document Suggestion List', () => {
  let engine: MockCaseAssistEngine;
  let docSuggestionList: DocumentSuggestionList;

  function initDocumentSuggestion() {
    docSuggestionList = buildDocumentSuggestionList(engine);
  }

  beforeEach(() => {
    engine = buildMockCaseAssistEngine();
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
      docSuggestionList.fetch();

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchDocumentSuggestions.pending.type,
        })
      );
    });
  });
});
