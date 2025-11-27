import {getAnalyticsSource} from '../../../api/analytics/analytics-selectors.js';
import {getCommerceApiBaseUrl} from '../../../api/commerce/commerce-api-client.js';
import type {BaseCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../../app/navigator-context-provider.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  getCartInitialState,
  getProductsFromCartState,
} from '../context/cart/cart-state.js';
import {getContextInitialState} from '../context/context-state.js';
import {
  buildBaseCommerceAPIRequest,
  type StateNeededForBaseCommerceAPIRequest,
} from './base-commerce-api-request-builder.js';

vi.mock('../../../api/analytics/analytics-selectors.js');
vi.mock('../../../api/commerce/commerce-api-client.js');
vi.mock('../context/cart/cart-state.js');

describe('#buildBaseCommerceAPIRequest', () => {
  let state: StateNeededForBaseCommerceAPIRequest;
  let navigatorContext: NavigatorContext;
  let request: BaseCommerceAPIRequest;

  const setState = (
    configuration?: Partial<StateNeededForBaseCommerceAPIRequest>
  ) => {
    state = {
      configuration: getConfigurationInitialState(),
      cart: getCartInitialState(),
      commerceContext: getContextInitialState(),
      ...configuration,
    };
  };

  const setNavigatorContext = (configuration?: Partial<NavigatorContext>) => {
    navigatorContext = {
      ...defaultNodeJSNavigatorContextProvider(),
      ...configuration,
    };
  };
  beforeEach(() => {
    vi.resetAllMocks();
    setState();
    setNavigatorContext();
  });

  it('sets #accessToken to #state.configuration.accessToken', () => {
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.accessToken).toBe(state.configuration.accessToken);
  });

  it('when #state.configuration.commerce.apiBaseUrl is defined, sets #url to its specified value', () => {
    const apiBaseUrl = 'https://some-url.com/rest/commerce';
    setState({
      configuration: {
        ...state.configuration,
        commerce: {
          ...state.configuration.commerce,
          apiBaseUrl: apiBaseUrl,
        },
      },
    });

    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(getCommerceApiBaseUrl).not.toHaveBeenCalled();
    expect(request.url).toBe(apiBaseUrl);
  });

  it('when #state.configuration.commerce.apiBaseUrl is undefined, sets #url to the value returned by #getCommerceApiBaseUrl(#configuration.organizationId, #configuration.environment)', () => {
    const organizationId = 'some-organization-id';
    const environment = 'hipaa';
    setState({
      configuration: {
        ...state.configuration,
        organizationId,
        environment,
        commerce: {
          ...state.configuration.commerce,
          apiBaseUrl: undefined,
        },
      },
    });

    const getCommerceApiBaseUrlReturnValue =
      'https://some-organization-id.orghipaa.coveo.com/rest/organizations/some-organization-id/commerce/v2';

    vi.mocked(getCommerceApiBaseUrl).mockReturnValue(
      getCommerceApiBaseUrlReturnValue
    );

    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(getCommerceApiBaseUrl).toHaveBeenCalledWith(
      organizationId,
      environment
    );
    expect(request.url).toBe(getCommerceApiBaseUrlReturnValue);
  });

  it('sets #organizationId to #state.configuration.organizationId', () => {
    const organizationId = 'some-organization-id';
    setState({
      configuration: {
        ...state.configuration,
        organizationId,
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.organizationId).toBe(organizationId);
  });

  it('sets #trackingId to #state.configuration.analytics.trackingId', () => {
    const trackingId = 'some-tracking-id';
    setState({
      configuration: {
        ...state.configuration,
        analytics: {
          ...state.configuration.analytics,
          trackingId,
        },
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.trackingId).toBe(trackingId);
  });

  describe('when #state.configuration.analytics.enabled is true', () => {
    beforeEach(() => {
      setState({
        configuration: {
          ...state.configuration,
          analytics: {
            ...state.configuration.analytics,
            enabled: true,
          },
        },
      });
    });

    it('sets #clientId to #navigatorContext.clientId', () => {
      const clientId = 'some-client-id';
      setState({
        configuration: {
          ...state.configuration,
          analytics: {
            ...state.configuration.analytics,
            enabled: true,
          },
        },
      });
      setNavigatorContext({
        clientId,
      });
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request).toHaveProperty('clientId', clientId);
    });

    it('when #navigatorContext.capture is undefined and #navigatorContext.clientId is not empty, sets #context.capture to true', () => {
      setNavigatorContext({
        clientId: 'some-client-id',
        capture: undefined,
      });
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request.context.capture).toBe(true);
    });

    it('when #navigatorContext.capture is undefined and #navigatorContext.clientId is empty, sets #context.capture to false', () => {
      setNavigatorContext({
        clientId: '',
        capture: undefined,
      });
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request.context.capture).toBe(false);
    });

    it('when #navigatorContext.capture is defined, sets #context.capture to its specified value', () => {
      setNavigatorContext({
        capture: false,
      });
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request.context.capture).toBe(false);
    });
  });

  describe('when #state.configuration.analytics.enabled is false', () => {
    beforeEach(() => {
      setState({
        configuration: {
          ...state.configuration,
          analytics: {
            ...state.configuration.analytics,
            enabled: false,
          },
        },
      });
    });

    it('does not set #clientId', () => {
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request).not.toHaveProperty('clientId');
    });

    it('when #navigatorContext.capture is undefined, sets #context.capture to false', () => {
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request.context.capture).toBe(false);
    });

    it('when #navigatorContext.capture is defined, sets #context.capture to its specified value', () => {
      setNavigatorContext({
        capture: true,
      });
      request = buildBaseCommerceAPIRequest(state, navigatorContext);

      expect(request.context.capture).toBe(true);
    });
  });

  it('sets #language to #state.commerceContext.language', () => {
    const language = 'en';
    setState({
      commerceContext: {
        ...state.commerceContext,
        language,
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.language).toBe(language);
  });

  it('sets #country to #state.commerceContext.country', () => {
    const country = 'CA';
    setState({
      commerceContext: {
        ...state.commerceContext,
        country,
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.country).toBe(country);
  });

  it('sets #currency to #state.commerceContext.currency', () => {
    const currency = 'CAD';
    setState({
      commerceContext: {
        ...state.commerceContext,
        currency,
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.currency).toBe(currency);
  });

  it('sets #context.user.latitude and #context.user.longitude to the corresponding #state.commerceContext.location values', () => {
    const location = {
      latitude: 1,
      longitude: 2,
    };
    setState({
      commerceContext: {
        ...state.commerceContext,
        location,
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.user?.latitude).toBe(location.latitude);
    expect(request.context.user?.longitude).toBe(location.longitude);
  });

  it('when #navigatorContext.userAgent is defined, sets #context.user.userAgent to its specified value', () => {
    const userAgent = 'some-user-agent';
    setNavigatorContext({
      userAgent,
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.user?.userAgent).toBe(userAgent);
  });

  it('when #navigatorContext.userAgent is undefined, does not set #context.user.userAgent', () => {
    setNavigatorContext({
      userAgent: undefined,
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.user?.userAgent).not.toBeDefined();
  });

  it('sets #context.view.url to #state.commerceContext.view.url', () => {
    const url = 'https://some-url.com/some-listing-page';
    setState({
      commerceContext: {
        ...state.commerceContext,
        view: {
          url,
        },
      },
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.view.url).toBe(url);
  });

  it('when #state.commerceContext.view.referrer is defined and #navigatorContext.referrer is undefined, sets #context.view.referrer to #state.commerceContext.view.referrer', () => {
    const referrer = 'some-referrer-from-context';
    setState({
      commerceContext: {
        ...state.commerceContext,
        view: {
          ...state.commerceContext.view,
          referrer,
        },
      },
    });
    setNavigatorContext({
      referrer: undefined,
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.view?.referrer).toBe(referrer);
  });

  it('when #state.commerceContext.view.referrer and #navigatorContext.referrer are both undefined, does not set #context.view.referrer', () => {
    setState({
      commerceContext: {
        ...state.commerceContext,
        view: {
          ...state.commerceContext.view,
          referrer: undefined,
        },
      },
    });
    setNavigatorContext({
      referrer: undefined,
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.view?.referrer).not.toBeDefined();
  });

  it('when #navigatorContext.referrer is defined, sets #context.view.referrer to its specified value', () => {
    const referrer = 'some-referrer-from-navigator-context';
    setNavigatorContext({
      referrer,
    });
    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(request.context.view.referrer).toBe(referrer);
  });

  it('sets #context.cart to the value returned by #getProductsFromCartState(#state.cart)', () => {
    setState({
      cart: {
        cart: {
          'cart-item-1': {
            productId: 'cart-item-1',
            quantity: 1,
            name: 'Cart Item 1',
            price: 1,
          },
          'cart-item-2': {
            productId: 'cart-item-2',
            quantity: 2,
            name: 'Cart Item 2',
            price: 1,
          },
        },
        cartItems: ['cart-item-1', 'cart-item-2'],
        purchased: {},
        purchasedItems: [],
      },
    });

    const getProductsFromCartStateReturnValue = [
      {productId: 'cart-item-1', quantity: 1},
      {productId: 'cart-item-2', quantity: 2},
    ];

    vi.mocked(getProductsFromCartState).mockReturnValue(
      getProductsFromCartStateReturnValue
    );

    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(getProductsFromCartState).toHaveBeenCalledWith(state.cart);
    expect(request.context.cart).toEqual(getProductsFromCartStateReturnValue);
  });

  it('sets #context.source to the value returned by #getAnalyticsSource(#state.configuration.analytics)', () => {
    setState({
      configuration: {
        ...state.configuration,
        analytics: {
          ...state.configuration.analytics,
          source: {
            '@coveo/atomic': '10.0.1',
          },
        },
      },
    });

    const getAnalyticsSourceReturnValue = [
      '@coveo/atomic@10.0.1',
      '@coveo/headless@10.1.2',
    ];

    vi.mocked(getAnalyticsSource).mockReturnValue(
      getAnalyticsSourceReturnValue
    );

    request = buildBaseCommerceAPIRequest(state, navigatorContext);

    expect(getAnalyticsSource).toHaveBeenCalledWith(
      state.configuration.analytics
    );
    expect(request.context.source).toEqual(getAnalyticsSourceReturnValue);
  });
});
