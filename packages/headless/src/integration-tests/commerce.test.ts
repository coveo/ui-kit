import {
  buildCart,
  buildContext,
  buildCommerceEngine,
  buildFacetGenerator,
  buildProductListing,
  buildRelevanceSortCriterion,
  buildSort,
  CommerceEngine,
  ProductListing,
} from '../commerce.index';
import {getOrganizationEndpoints} from '../insight.index';
import {waitForNextStateChange} from '../test/functional-test-utils';

const accessToken = 'no';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-149: Skipped since we do not currently have test fixtures for commerce
describe('commerce', () => {
  let engine: CommerceEngine;

  beforeEach(() => {
    // eslint-disable-next-line @cspell/spellchecker
    const organizationId = 'barcasportsmcy01fvu';
    engine = buildCommerceEngine({
      configuration: {
        organizationId,
        accessToken,
        organizationEndpoints: {
          ...getOrganizationEndpoints(organizationId, 'dev'),
          platform: 'https://platformdev.cloud.coveo.com',
        },
      },
      loggerOptions: {level: 'silent'},
    });

    buildContext(engine, {
      options: {
        trackingId: 'barca',
        language: 'en-gb',
        currency: 'gbp',
        clientId: '41915baa-621c-4408-b9c0-6e59b3cde129',
        view: {
          url: 'https://sports-dev.barca.group/browse/promotions/surf-with-us-this-year',
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

  it('has no facets', async () => {
    await fetchProductListing();

    const facetGenerator = buildFacetGenerator(engine);

    expect(facetGenerator.state.facets).toEqual([]);
  });
});
