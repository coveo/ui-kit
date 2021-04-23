import {fetchResultContent} from './result-preview-actions';
import {resultPreviewReducer} from './result-preview-slice';
import {
  getResultPreviewInitialState,
  ResultPreviewState,
} from './result-preview-state';

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
});
