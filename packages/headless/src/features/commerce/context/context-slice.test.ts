import {setContext, setView} from './context-actions.js';
import {contextReducer} from './context-slice.js';
import {CommerceContextState, getContextInitialState} from './context-state.js';

describe('context-slice', () => {
  let state: CommerceContextState;
  beforeEach(() => {
    state = getContextInitialState();
  });

  it('should have an initial state', () => {
    expect(contextReducer(undefined, {type: 'foo'})).toEqual(
      getContextInitialState()
    );
  });

  it('should allow to set context', () => {
    expect(
      contextReducer(
        state,
        setContext({
          language: 'fr',
          country: 'ca',
          currency: 'CAD',
          view: {
            url: 'https://example.org',
          },
        })
      )
    ).toEqual({
      language: 'fr',
      country: 'ca',
      currency: 'CAD',
      view: {
        url: 'https://example.org',
      },
    });
  });

  it('should allow to set the view', () => {
    const view = {
      url: 'https://example.org',
    };
    expect(contextReducer(state, setView(view)).view).toEqual(view);
  });
});
