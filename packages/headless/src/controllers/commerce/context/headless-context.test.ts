import {
  setContext,
  setUser,
  setView,
} from '../../../features/commerce/context/context-actions';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildContext, Context} from './headless-context';

jest.mock('../../../features/commerce/context/context-actions');

describe('headless commerce context', () => {
  const options = {
    trackingId: 'some-tracking-id',
    language: 'en',
    country: 'us',
    currency: 'USD',
    view: {
      url: 'https://example.org',
    },
  };

  let context: Context;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildMockCommerceEngine({
      ...buildMockCommerceState(),
      commerceContext: {
        ...options,
      },
    });
    context = buildContext(engine, {options});
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceContext: contextReducer,
    });
  });

  it('dispatches #setContext on load', () => {
    expect(setContext).toHaveBeenCalled();
  });

  it('setTrackingId dispatches #setContext', () => {
    context.setTrackingId('new-tracking-id');
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({trackingId: 'new-tracking-id'})
    );
  });

  it('setLanguage dispatches #setContext', () => {
    context.setLanguage('new-language');
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({language: 'new-language'})
    );
  });

  it('setCountry dispatches #setContext', () => {
    context.setCountry('new-country');
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({country: 'new-country'})
    );
  });

  it('setCurrency dispatches #setContext', () => {
    context.setCurrency('new-currency');
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({currency: 'new-currency'})
    );
  });

  it('setUser dispatches #setUser', () => {
    context.setUser({
      userId: 'some-user-id',
    });
    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({userId: 'some-user-id'})
    );
  });

  it('setView dispatches #setView', () => {
    context.setView({
      url: 'https://example.org',
      referrer: 'https://example.org/referrer',
    });
    expect(setView).toHaveBeenCalled();
  });
});
