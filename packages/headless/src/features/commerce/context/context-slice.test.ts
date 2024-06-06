import {setContext, setUser, setView} from './context-actions';
import {contextReducer} from './context-slice';
import {CommerceContextState, getContextInitialState} from './context-state';

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

  describe('#setUser', () => {
    it('should allow to set the user', () => {
      const user = {
        userAgent: 'some-user-agent',
      };
      expect(contextReducer(state, setUser(user)).user).toEqual(user);
    });
  });

  it('should allow to set the view', () => {
    const view = {
      url: 'https://example.org',
    };
    expect(contextReducer(state, setView(view)).view).toEqual(view);
  });
});
