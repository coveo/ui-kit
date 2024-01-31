import {Action} from '@reduxjs/toolkit';
import {
  setContext,
  setUser,
  setView,
} from '../../../features/commerce/context/context-actions';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {MockCommerceEngine} from '../../../test/mock-engine';
import {buildMockCommerceEngine} from '../../../test/mock-engine';
import {buildContext, Context} from './headless-context';

describe('headless commerce context', () => {
  const options = {
    trackingId: 'some-tracking-id',
    language: 'en',
    country: 'us',
    currency: 'USD',
    clientId: 'some-client-id',
    view: {
      url: 'https://example.org',
    },
  };

  let context: Context;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine({
      state: {
        ...buildMockCommerceState(),
        commerceContext: {
          ...options,
        },
      },
    });
    context = buildContext(engine, {options});
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  const expectContainActionWithPayload = (action: Action, payload: object) => {
    expect(engine.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: action.type,
          payload: expect.objectContaining(payload),
        }),
      ])
    );
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceContext: contextReducer,
    });
  });

  it('dispatches #setContext on load', () => {
    expectContainAction(setContext);
  });

  it('setTrackingId dispatches #setContext', () => {
    context.setTrackingId('new-tracking-id');
    expectContainActionWithPayload(setContext, {trackingId: 'new-tracking-id'});
  });

  it('setLanguage dispatches #setContext', () => {
    context.setLanguage('new-language');
    expectContainActionWithPayload(setContext, {language: 'new-language'});
  });

  it('setCountry dispatches #setContext', () => {
    context.setCountry('new-country');
    expectContainActionWithPayload(setContext, {country: 'new-country'});
  });

  it('setCurrency dispatches #setContext', () => {
    context.setCurrency('new-currency');
    expectContainActionWithPayload(setContext, {currency: 'new-currency'});
  });

  it('setClientId dispatches #setContext', () => {
    context.setClientId('new-client-id');
    expectContainActionWithPayload(setContext, {clientId: 'new-client-id'});
  });

  it('setUser dispatches #setUser', () => {
    context.setUser({
      userId: 'some-user-id',
    });
    expectContainAction(setUser);
  });

  it('setView dispatches #setView', () => {
    context.setView({
      url: 'https://example.org',
      referrer: 'https://example.org/referrer',
    });
    expectContainAction(setView);
  });
});
