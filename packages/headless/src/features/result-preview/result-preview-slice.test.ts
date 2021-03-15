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
    });
  });

  it(`on #fetchResultContent.fulfilled,
  it sets the state #uniqueId and #content to the payload values`, () => {
    const payload = {
      uniqueId: '1',
      content: '<div></div>',
    };
    const action = fetchResultContent.fulfilled(payload, '', {uniqueId: '1'});

    state = resultPreviewReducer(state, action);
    expect(state).toEqual(payload);
  });
});
