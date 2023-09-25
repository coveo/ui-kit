import {buildCart, buildCommerceEngine, buildProductListing} from '../commerce.index';
import {getOrganizationEndpoints} from '../insight.index';
import {buildContext} from '../controllers/commerce/context/headless-context';

let accessToken = 'no'
const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

describe('commerce', () => {
  it("'s working great",
    async () => {
      const engine = buildCommerceEngine({
        configuration: {
          organizationId: 'commercestore',
          accessToken,
          organizationEndpoints: {
            ...getOrganizationEndpoints('commercestore', 'dev'),
          }
        },
      })

      buildContext(engine, {
        options: {
          view: {
            url: 'https://example.org'
          }
        }
      })

      const cart = buildCart(engine)
      cart.addCartItem({
        product: {
          sku: 'nice shoes'
        },
        quantity: 2
      })
      cart.addCartItem({
        product: {
          sku: 'small green boots'
        },
        quantity: 3
      })

      const productListing = buildProductListing(engine)
      productListing.refresh()
      await sleep(2);
      console.log('final state!!!', productListing.state)
    })
})
