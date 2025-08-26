import type {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request.js';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../../app/navigator-context-provider.js';
import {buildMockBaseCommerceAPIRequest} from '../../../test/mock-commerce-api-request.js';
import {getQuerySetInitialState} from '../../query-set/query-set-state.js';
import {buildBaseCommerceAPIRequest} from '../common/base-commerce-api-request-builder.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getCartInitialState} from '../context/cart/cart-state.js';
import {getContextInitialState} from '../context/context-state.js';
import {getCommerceQueryInitialState} from '../query/query-state.js';
import type {StateNeededByQuerySuggest} from './query-suggest-actions.js';
import {buildQuerySuggestRequest} from './query-suggest-request-builder.js';

vi.mock('../common/base-commerce-api-request-builder.js');

describe('#buildQuerySuggestRequest', () => {
  let state: StateNeededByQuerySuggest;
  let navigatorContext: NavigatorContext;
  let request: QuerySuggestRequest;

  const querySetId = 'querySetId';
  const mockBaseCommerceAPIRequest = buildMockBaseCommerceAPIRequest();

  const setState = (configuration?: Partial<StateNeededByQuerySuggest>) => {
    state = {
      configuration: getConfigurationInitialState(),
      cart: getCartInitialState(),
      commerceContext: getContextInitialState(),
      querySet: getQuerySetInitialState(),
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
    vi.mocked(buildBaseCommerceAPIRequest).mockReturnValue(
      mockBaseCommerceAPIRequest
    );
    setState();
    setNavigatorContext();
  });

  it('sets base properties to the value returned by #buildBaseCommerceAPIRequest(#state, #navigatorContext)', () => {
    const {query: _query, ...restOfRequest} = buildQuerySuggestRequest(
      querySetId,
      state,
      navigatorContext
    );

    expect(buildBaseCommerceAPIRequest).toHaveBeenCalledWith(
      state,
      navigatorContext
    );
    expect(restOfRequest).toEqual(mockBaseCommerceAPIRequest);
  });

  it('sets #query to #state.querySet[querySetId]', () => {
    const query = 'some-query';
    setState({
      querySet: {
        [querySetId]: query,
      },
    });
    request = buildQuerySuggestRequest(querySetId, state, navigatorContext);

    expect(request.query).toBe(query);
  });
});
