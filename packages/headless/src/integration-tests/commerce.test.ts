import {
  buildCart,
  buildCommerceEngine, buildFacetGenerator,
  buildProductListing,
} from '../commerce.index';
import {buildContext} from '../controllers/commerce/context/headless-context';
import {getOrganizationEndpoints} from '../insight.index';
import {waitForNextStateChange} from '../test/functional-test-utils';

const accessToken = 'no';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-149: Skipped since we do not currently have test fixtures for commerce
describe.skip('commerce', () => {
  it("'s working great", async () => {
    const engine = buildCommerceEngine({
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

    const productListing = buildProductListing(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        productListing.refresh();
      },
      expectedSubscriberCalls: 2,
    });

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

  it('has working facets', async () => {
    const engine = buildCommerceEngine({
      configuration: {
        organizationId: 'commercestore',
        accessToken,
        organizationEndpoints: {
          ...getOrganizationEndpoints('commercestore', 'dev'),
          platform: 'https://platformdev.cloud.coveo.com',
        },
      },
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

    const productListing = buildProductListing(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        productListing.refresh();
      },
      expectedSubscriberCalls: 2,
    });

    const facetGenerator = buildFacetGenerator(engine);
    facetGenerator.state.facets.forEach((facet) => {
      console.log(facet.state.facetId);
    })

    expect(facetGenerator.state.facets).toEqual({});
  })
});
