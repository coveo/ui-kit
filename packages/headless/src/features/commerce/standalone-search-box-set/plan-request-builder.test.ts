import type {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request.js';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../../app/navigator-context-provider.js';
import {buildMockBaseCommerceAPIRequest} from '../../../test/mock-commerce-api-request.js';
import {buildBaseCommerceAPIRequest} from '../common/base-commerce-api-request-builder.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getCartInitialState} from '../context/cart/cart-state.js';
import {getContextInitialState} from '../context/context-state.js';
import {getCommerceQueryInitialState} from '../query/query-state.js';
import {
  buildPlanRequest,
  type StateNeededForPlanCommerceAPIRequest,
} from './plan-request-builder.js';

vi.mock('../common/base-commerce-api-request-builder.js');

describe('#buildPlanRequest', () => {
  let state: StateNeededForPlanCommerceAPIRequest;
  let navigatorContext: NavigatorContext;
  let request: QuerySuggestRequest;

  const baseRequest = buildMockBaseCommerceAPIRequest();

  const setState = (
    configuration?: Partial<StateNeededForPlanCommerceAPIRequest>
  ) => {
    state = {
      configuration: getConfigurationInitialState(),
      cart: getCartInitialState(),
      commerceContext: getContextInitialState(),
      commerceQuery: getCommerceQueryInitialState(),
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
    vi.mocked(buildBaseCommerceAPIRequest).mockReturnValue(baseRequest);
    setState();
    setNavigatorContext();
  });

  it('sets base properties, except #context.capture, to the value returned by #buildBaseCommerceAPIRequest(#state, #navigatorContext)', () => {
    const {
      query: _query,
      page: _page,
      perPage: _perPage,
      ...restOfPlanRequest
    } = buildPlanRequest(state, navigatorContext);

    const {capture: _planRequestCapture, ...restOfPlanRequestContext} =
      restOfPlanRequest.context;
    const basePropertiesWithoutCapture = {
      ...restOfPlanRequest,
      context: {...restOfPlanRequestContext},
    };

    const {capture: _baseRequestCapture, ...restOfBaseRequestContext} =
      baseRequest.context;
    const baseRequestWithoutCapture = {
      ...baseRequest,
      context: {...restOfBaseRequestContext},
    };

    expect(buildBaseCommerceAPIRequest).toHaveBeenCalledWith(
      state,
      navigatorContext
    );
    expect(basePropertiesWithoutCapture).toEqual(baseRequestWithoutCapture);
  });

  it('sets #context.capture to false', () => {
    const {context} = buildPlanRequest(state, navigatorContext);

    expect(context.capture).toBe(false);
  });

  it('sets #page to 0', () => {
    const {page} = buildPlanRequest(state, navigatorContext);

    expect(page).toBe(0);
  });

  it('sets #perPage to 1', () => {
    const {perPage} = buildPlanRequest(state, navigatorContext);

    expect(perPage).toBe(1);
  });

  it('sets #query to #state.commerceQuery.query', () => {
    const query = 'some-query';
    setState({
      commerceQuery: {
        query,
      },
    });
    request = buildPlanRequest(state, navigatorContext);

    expect(request.query).toBe(query);
  });
});
