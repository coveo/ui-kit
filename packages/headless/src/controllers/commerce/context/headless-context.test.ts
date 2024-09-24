import {
  setContext,
  setView,
} from '../../../features/commerce/context/context-actions.js';
import {contextReducer} from '../../../features/commerce/context/context-slice.js';
import {CommerceContextState} from '../../../features/commerce/context/context-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildContext, Context} from './headless-context.js';

vi.mock('../../../features/commerce/context/context-actions');

describe('headless commerce context', () => {
  const options: CommerceContextState = {
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
    vi.resetAllMocks();
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

  it('when context is provided, dispatches #setContext on load', () => {
    expect(setContext).toHaveBeenCalled();
  });

  it('when context is not provided, does not dispatch #setContext on load', () => {
    vi.resetAllMocks();

    context = buildContext(engine);

    expect(setContext).not.toHaveBeenCalled();
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
    context.setCurrency('CAD');
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({currency: 'CAD'})
    );
  });

  it('setView dispatches #setView', () => {
    context.setView({
      url: 'https://example.org',
    });
    expect(setView).toHaveBeenCalled();
  });
});
