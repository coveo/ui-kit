import {
  DocumentSuggestionResponse,
  GetDocumentSuggestionsResponse,
} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';
import {buildMockDocumentSuggestion} from '../../test/mock-case-assist-document-suggestion.js';
import {fetchDocumentSuggestions} from './document-suggestion-actions.js';
import {documentSuggestionReducer} from './document-suggestion-slice.js';
import {
  getDocumentSuggestionInitialState,
  DocumentSuggestionState,
} from './document-suggestion-state.js';

describe('document suggestion slice', () => {
  let state: DocumentSuggestionState;
  const mockDocument: DocumentSuggestionResponse =
    buildMockDocumentSuggestion();

  beforeEach(() => {
    state = getDocumentSuggestionInitialState();
  });

  it('should have an initial state', () => {
    expect(documentSuggestionReducer(undefined, {type: 'foo'})).toEqual(
      getDocumentSuggestionInitialState()
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
      const finalState = documentSuggestionReducer(state, action);

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
      const finalState = documentSuggestionReducer(state, action);
      expect(finalState.status.error).toEqual(err);
      expect(finalState.status.loading).toBe(false);
    });

    it('set the isLoading state to true during fetchDocumentSuggestions.pending', () => {
      const pendingAction = fetchDocumentSuggestions.pending('');
      const finalState = documentSuggestionReducer(state, pendingAction);
      expect(finalState.status.loading).toBe(true);
    });
  });
});
