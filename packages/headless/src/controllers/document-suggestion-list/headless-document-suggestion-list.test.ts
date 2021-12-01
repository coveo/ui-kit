import {
  DocumentSuggestionList,
  buildDocumentSuggestionList,
} from './headless-document-suggestion-list';
import {
  buildMockCaseAssistEngine,
  MockCaseAssistEngine,
} from '../../test/mock-engine';
import {
  caseAssistConfiguration,
  caseField,
  caseInput,
  configuration,
  documentSuggestion,
} from '../../app/reducers';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';
import {getDocumentSuggestionInitialState} from '../../features/document-suggestion/document-suggestion-state';

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
