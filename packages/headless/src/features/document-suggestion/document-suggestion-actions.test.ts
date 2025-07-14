import type {CaseAssistAppState} from '../../state/case-assist-app-state.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {buildMockNavigatorContextProvider} from '../../test/mock-navigator-context-provider.js';
import {buildFetchDocumentSuggestionsRequest} from './document-suggestion-actions.js';

describe('buildFetchDocumentSuggestionsRequest', () => {
  describe('when analytics are enabled', () => {
    let state: CaseAssistAppState;
    beforeEach(() => {
      state = buildMockCaseAssistState();
      state.configuration.analytics.enabled = true;
    });

    it('should include the #analytics section in the request', async () => {
      const request = await buildFetchDocumentSuggestionsRequest(
        state,
        buildMockNavigatorContextProvider()()
      );
      expect(request.analytics).toBeDefined();
    });
  });

  describe('when analytics are disabled', () => {
    let state: CaseAssistAppState;
    beforeEach(() => {
      state = buildMockCaseAssistState();
      state.configuration.analytics.enabled = false;
    });

    it('should not include the #analytics section in the request', async () => {
      const request = await buildFetchDocumentSuggestionsRequest(
        state,
        buildMockNavigatorContextProvider()()
      );
      expect(request.analytics).not.toBeDefined();
    });
  });
});
