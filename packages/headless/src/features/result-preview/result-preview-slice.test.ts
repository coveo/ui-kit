import {buildMockResult} from '../../test/mock-result.js';
import {buildMockResultPreviewRequest} from '../../test/mock-result-preview-request-builder.js';
import {
  buildMockLegacySearch,
  buildMockSearch,
} from '../../test/mock-search.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {logInterfaceLoad} from '../analytics/analytics-actions.js';
import {executeSearch} from '../insight-search/insight-search-actions.js';
import {logPageNext} from '../pagination/pagination-analytics-actions.js';
import {fetchMoreResults, fetchPage} from '../search/search-actions.js';
import {
  fetchResultContent,
  nextPreview,
  preparePreviewPagination,
  previousPreview,
  updateContentURL,
} from './result-preview-actions.js';
import {resultPreviewReducer} from './result-preview-slice.js';
import {
  getResultPreviewInitialState,
  type ResultPreviewState,
} from './result-preview-state.js';

describe('ResultPreview', () => {
  let state: ResultPreviewState;

  beforeEach(() => {
    state = getResultPreviewInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = resultPreviewReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      uniqueId: '',
      content: '',
      isLoading: false,
      resultsWithPreview: [],
      position: -1,
    });
  });

  describe('on #executeSearch.fulfilled', () => {
    it('re-initialize the state to initial when a query returns correctly', () => {
      state.content = 'content';
      state.contentURL = 'url';
      state.isLoading = true;
      state.uniqueId = 'uniqueId';
      const action = executeSearch.fulfilled(buildMockLegacySearch(), '', {
        legacy: logInterfaceLoad(),
      });

      const finalState = resultPreviewReducer(state, action);

      expect(finalState).toEqual(getResultPreviewInitialState());
    });

    it('updates #resultsWithPreview property with the new results', () => {
      state.resultsWithPreview = ['foo', 'bar'];

      const search = buildMockLegacySearch({
        response: buildMockSearchResponse({
          results: [
            buildMockResult({hasHtmlVersion: true, uniqueId: 'first'}),
            buildMockResult({hasHtmlVersion: false, uniqueId: 'second'}),
            buildMockResult({hasHtmlVersion: false, uniqueId: 'third'}),
            buildMockResult({hasHtmlVersion: true, uniqueId: 'fourth'}),
          ],
        }),
      });
      const action = executeSearch.fulfilled(search, '', {
        legacy: logInterfaceLoad(),
      });
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.resultsWithPreview).toEqual(['first', 'fourth']);
    });
  });

  describe('on #fetchMoreResults.fulfilled', () => {
    it('re-initialize the state to initial when a query returns correctly', () => {
      state.content = 'content';
      state.contentURL = 'url';
      state.isLoading = true;
      state.uniqueId = 'uniqueId';
      const action = fetchMoreResults.fulfilled(buildMockSearch(), '');

      const finalState = resultPreviewReducer(state, action);

      expect(finalState).toEqual(getResultPreviewInitialState());
    });

    it('concat #resultsWithPreview property with the new results', () => {
      state.resultsWithPreview = ['first', 'fourth'];
      const search = buildMockSearch({
        response: buildMockSearchResponse({
          results: [
            buildMockResult({hasHtmlVersion: true, uniqueId: 'fifth'}),
            buildMockResult({hasHtmlVersion: false, uniqueId: 'sixth'}),
            buildMockResult({hasHtmlVersion: false, uniqueId: 'seventh'}),
            buildMockResult({hasHtmlVersion: true, uniqueId: 'eight'}),
          ],
        }),
      });
      const action = fetchMoreResults.fulfilled(search, '');
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.resultsWithPreview).toEqual([
        'first',
        'fourth',
        'fifth',
        'eight',
      ]);
    });
  });

  describe('on #fetchPage.fulfilled', () => {
    it('re-initialize the state to initial when a query returns correctly', () => {
      state.content = 'content';
      state.contentURL = 'url';
      state.isLoading = true;
      state.uniqueId = 'uniqueId';
      const action = fetchPage.fulfilled(buildMockSearch(), '', {
        legacy: logPageNext(),
      });

      const finalState = resultPreviewReducer(state, action);

      expect(finalState).toEqual(getResultPreviewInitialState());
    });
  });

  describe('on #preparePreviewPagination', () => {
    it('updates the #resultsWithPreview property with new results', () => {
      const results = [
        buildMockResult({hasHtmlVersion: true, uniqueId: 'first'}),
        buildMockResult({hasHtmlVersion: false, uniqueId: 'second'}),
        buildMockResult({hasHtmlVersion: false, uniqueId: 'third'}),
        buildMockResult({hasHtmlVersion: true, uniqueId: 'fourth'}),
      ];
      const action = preparePreviewPagination({results});
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.resultsWithPreview).toEqual(['first', 'fourth']);
    });
  });

  describe('on #nextPreview', () => {
    it('updates #position by one', () => {
      state.resultsWithPreview = ['one', 'two', 'three'];
      state.position = 0;
      const action = nextPreview();
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.position).toBe(1);
    });

    it('updates #position to 0 when it reaches the last position', () => {
      state.resultsWithPreview = ['one', 'two', 'three'];
      state.position = 2;
      const action = nextPreview();
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.position).toBe(0);
    });
  });

  describe('on #previousPreview', () => {
    it('updates #position by one', () => {
      state.resultsWithPreview = ['one', 'two', 'three'];
      state.position = 1;
      const action = previousPreview();
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.position).toBe(0);
    });

    it('updates #position to last of #resultsWithPreview when it reaches the first position', () => {
      state.resultsWithPreview = ['one', 'two', 'three'];
      state.position = 0;
      const action = previousPreview();
      const finalState = resultPreviewReducer(state, action);
      expect(finalState.position).toBe(2);
    });
  });

  it(`on #fetchResultContent.pending,
  it sets #isLoading to true`, () => {
    state.isLoading = false;
    const action = fetchResultContent.pending('', {uniqueId: '1'});

    state = resultPreviewReducer(state, action);
    expect(state.isLoading).toBe(true);
  });

  describe('on #fetchResultContent.fulfilled', () => {
    const payload = {
      uniqueId: '1',
      content: '<div></div>',
    };

    it('sets the #uniqueId and #content to the payload values', () => {
      const action = fetchResultContent.fulfilled(payload, '', {uniqueId: '1'});
      state = resultPreviewReducer(state, action);

      expect(state.content).toEqual(payload.content);
      expect(state.uniqueId).toBe(payload.uniqueId);
    });

    it('sets #isLoading to false', () => {
      state.isLoading = true;

      const action = fetchResultContent.fulfilled(payload, '', {uniqueId: '1'});
      state = resultPreviewReducer(state, action);

      expect(state.isLoading).toBe(false);
    });
  });

  it('on #updateContentURL.fulfilled, it sets #contentURL', () => {
    const testPath = '/html';
    const testUniqueId = '1';
    const payload = {
      contentURL: 'https://testurl.coveo.com/html?',
    };

    state.contentURL = undefined;
    const action = updateContentURL.fulfilled(payload, '', {
      uniqueId: testUniqueId,
      path: testPath,
      buildResultPreviewRequest: buildMockResultPreviewRequest,
    });

    state = resultPreviewReducer(state, action);

    expect(state.contentURL).toBe(payload.contentURL);
  });
});
