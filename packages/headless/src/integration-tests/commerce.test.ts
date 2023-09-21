import {buildCommerceEngine, buildProductListing} from '../commerce.index';
import {getOrganizationEndpoints} from '../insight.index';
import {buildContext} from '../controllers/commerce/context/headless-context';

let accessToken = 'no'
const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

describe('commerce', () => {
  it(`
              Commerce headless, bright,
              Subpackage in JSON's light,
              Code takes its first flight.
              `,
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

      const contextController = buildContext(engine, {
        options: {
          view: {
            url: 'https://example.org'
          }
        }
      })

      const controller = buildProductListing(engine, {options: {url: 'https://example.org'}})
      controller.refresh()
      await sleep(2);
      console.log('final state!!!', controller.state)
    })
})
