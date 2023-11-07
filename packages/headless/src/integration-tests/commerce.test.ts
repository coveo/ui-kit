import {
  buildCart,
  buildCommerceEngine,
  buildContext,
  buildProductListing,
  buildRelevanceSortCriterion,
  buildSort,
  CommerceEngine,
  ProductListing,
} from '../commerce.index';
import {
  buildSearch,
  Search,
} from '../controllers/commerce/search/headless-search';
import {getOrganizationEndpoints} from '../insight.index';
import {waitForNextStateChange} from '../test/functional-test-utils';

const accessToken = 'no';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-149: Skipped since we do not currently have test fixtures for commerce
describe.skip('commerce', () => {
  let engine: CommerceEngine;

  beforeEach(() => {
    engine = buildCommerceEngine({
      configuration: {
        organizationId: 'commercestore',
        accessToken,
        organizationEndpoints: {
          ...getOrganizationEndpoints('commercestore', 'dev'),
          platform: 'https://platformdev.cloud.coveo.com',
        },
      },
      loggerOptions: {level: 'silent'},
    });

    buildContext(engine, {
      options: {
        trackingId: 'commercestore-tracking-id',
        language: 'en',
        currency: 'USD',
        clientId: '41915baa-621c-4408-b9c0-6e59b3cde129',
        view: {
          url: 'http://mystore.com/sales',
        },
      },
    });

    const cart = buildCart(engine);
    cart.addItem({
      productId: 'nice shoes',
      quantity: 2,
    });
    cart.addItem({
      productId: 'nicer shoes',
      quantity: 3,
    });
  });

  const fetchProductListing = async (): Promise<ProductListing> => {
    const productListing = buildProductListing(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        productListing.refresh();
      },
      expectedSubscriberCalls: 2,
    });

    return productListing;
  };

  const query = async (): Promise<Search> => {
    const search = buildSearch(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        search.executeFirstSearch();
      },
      expectedSubscriberCalls: 2,
    });

    return search;
  };

  it('uses the context to fetch the product listing', async () => {
    const productListing = await fetchProductListing();

    expect(productListing.state.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ec_name: 'adidas_sale',
        }),
        expect.objectContaining({
          ec_name: 'nike_sale',
        }),
        expect.objectContaining({
          ec_name: 'puma_sale',
        }),
      ])
    );
  });

  it('applies sort to product listing', async () => {
    const sort = buildSort(engine);
    const relevance = buildRelevanceSortCriterion();
    sort.sortBy(relevance);

    await fetchProductListing();

    expect(sort.isSortedBy(relevance)).toBeTruthy();
    expect(sort.isAvailable(relevance)).toBeTruthy();
    expect(sort.state.availableSorts.length).toEqual(2);
  });

  it('uses the context to search', async () => {
    const search = await query();

    expect(search.state.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ec_name: 'adidas_sale',
        }),
        expect.objectContaining({
          ec_name: 'nike_sale',
        }),
        expect.objectContaining({
          ec_name: 'puma_sale',
        }),
      ])
    );
  });

  it('applies sort to search', async () => {
    const sort = buildSort(engine);
    const relevance = buildRelevanceSortCriterion();
    sort.sortBy(relevance);

    await query();

    expect(sort.isSortedBy(relevance)).toBeTruthy();
    expect(sort.isAvailable(relevance)).toBeTruthy();
    expect(sort.state.availableSorts.length).toEqual(2);
  });
});
