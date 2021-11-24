import {
  DocumentSuggestion,
  GetDocumentSuggestionsResponse,
} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response';
import {fetchDocumentSuggestions} from './document-suggestions-actions';
import {documentSuggestionsReducer} from './document-suggestions-slice';
import {
  getDocumentSuggestionsInitialState,
  DocumentSuggestionsState,
} from './document-suggestions-state';

describe('document suggestions slice', () => {
  let state: DocumentSuggestionsState;
  const mockDocument: DocumentSuggestion = {
    clickUri: 'www.clikuri.com',
    title: 'Mock Document',
    excerpt: 'This is a dang good mock document.',
    fields: {
      type: 'mock',
    },
    hasHtmlVersion: true,
    uniqueId: '123ID',
  };

  beforeEach(() => {
    state = getDocumentSuggestionsInitialState();
  });

  it('should have an initial state', () => {
    expect(documentSuggestionsReducer(undefined, {type: 'foo'})).toEqual(
      getDocumentSuggestionsInitialState()
    );
  });

  describe('#fetchDocumentSuggestions', () => {
    const buildMockDocumentSuggestionsResponse =
      (): GetDocumentSuggestionsResponse => ({
        documents: [mockDocument],
        totalCount: 0,
        responseId: 'response-id',
      });

    it('when a fetchDocumentSuggestions fulfilled is received, it updates the state to the received payload', () => {
      const response = buildMockDocumentSuggestionsResponse();
      state.documents = [];
      const action = fetchDocumentSuggestions.fulfilled(
        {
          response: response,
        },
        ''
      );
      const finalState = documentSuggestionsReducer(state, action);

      expect(finalState.documents).toEqual(response.documents);
      expect(finalState.status.loading).toBe(false);
      expect(finalState.status.error).toBeNull();
    });

    it('set the error on rejection', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = fetchDocumentSuggestions.rejected(null, '');
      action.payload = err;
      const finalState = documentSuggestionsReducer(state, action);
      expect(finalState.status.error).toEqual(err);
      expect(finalState.status.loading).toBe(false);
    });

    it('set the isLoading state to true during fetchDocumentSuggestions.pending', () => {
      const pendingAction = fetchDocumentSuggestions.pending('');
      const finalState = documentSuggestionsReducer(state, pendingAction);
      expect(finalState.status.loading).toBe(true);
    });
  });
});
