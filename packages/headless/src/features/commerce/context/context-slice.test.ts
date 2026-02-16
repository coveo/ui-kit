import {
  setContext,
  setCustom,
  setLocation,
  setView,
} from './context-actions.js';
import {contextReducer} from './context-slice.js';
import {
  type CommerceContextState,
  getContextInitialState,
} from './context-state.js';

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

  it('should allow to set the location', () => {
    const location = {
      latitude: -10.2,
      longitude: 20.1,
    };
    expect(contextReducer(state, setLocation(location)).location).toEqual(
      location
    );
  });

  it('should allow to set custom context', () => {
    const custom = {
      userId: 'user-123',
      sessionId: 12345,
      isLoggedIn: true,
      metadata: {tier: 'premium'},
    };
    expect(contextReducer(state, setCustom(custom)).custom).toEqual(custom);
  });

  it('should return an error when setCustom is called with null', () => {
    // biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
    const action = setCustom(null as any);
    expect('error' in action && action.error).toBeDefined();
  });

  it('should allow clearing custom context with undefined', () => {
    state.custom = {existingKey: 'value'};
    const action = setCustom(undefined);
    expect('error' in action ? action.error : undefined).toBeUndefined();
    expect(contextReducer(state, action).custom).toBeUndefined();
  });

  it('should allow to set an empty object as custom context', () => {
    const custom = {};
    const action = setCustom(custom);
    expect('error' in action ? action.error : undefined).toBeUndefined();
    expect(contextReducer(state, action).custom).toEqual(custom);
  });
});
