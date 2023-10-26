import {setContext, setUser, SetUserPayload, setView} from './context-actions';
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
          trackingId: 'some-tracking-id',
          currency: 'CAD',
          language: 'fr',
          clientId: 'some-client-id',
          view: {
            url: 'https://example.org',
          },
        })
      )
    ).toEqual({
      trackingId: 'some-tracking-id',
      currency: 'CAD',
      language: 'fr',
      clientId: 'some-client-id',
      view: {
        url: 'https://example.org',
      },
    });
  });

  describe('#setUser', () => {
    it('should allow to set the user', () => {
      const user = {
        userAgent: 'some-user-agent',
        userIp: 'some-user-ip',
        email: 'email@example.org',
        userId: 'userId',
      };
      expect(contextReducer(state, setUser(user)).user).toEqual(user);
    });

    it('throws when no userId nor email are provided', () => {
      const user = {} as SetUserPayload;
      expect('error' in setUser(user)).toBe(true);
    });
  });

  it('should allow to set the view', () => {
    const view = {
      url: 'https://example.org',
    };
    expect(contextReducer(state, setView(view)).view).toEqual(view);
  });
});
