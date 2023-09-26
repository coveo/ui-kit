import {buildCart, buildCommerceEngine, buildProductListing} from '../commerce.index';
import {getOrganizationEndpoints} from '../insight.index';
import {buildContext} from '../controllers/commerce/context/headless-context';
import {waitForNextStateChange} from '../test/functional-test-utils';

let accessToken = 'no'

describe('commerce', () => {
  it("'s working great",
    async () => {
      const engine = buildCommerceEngine({
        configuration: {
          organizationId: 'commercestore',
          accessToken,
          organizationEndpoints: {
            ...getOrganizationEndpoints('commercestore', 'dev'),
            platform: 'https://platformdev.cloud.coveo.com',
          }
        },
        //loggerOptions: {level: 'silent'},
      })

      buildContext(engine, {
        options: {
          trackingId: 'commercestore-tracking-id',
          language: 'en',
          currency: 'USD',
          clientId: '41915baa-621c-4408-b9c0-6e59b3cde129',
          view: {
            url: 'http://mystore.com/sales'
          }
        }
      })

      const cart = buildCart(engine)
      cart.addItem({
        productId: 'nice shoes',
        quantity: 2
      })
      cart.addItem({
        productId: 'nice shoes',
        quantity: 3
      })

      let productListing = buildProductListing(engine);
      await waitForNextStateChange(engine, {
        action: () => {
          productListing.refresh()
        },
        expectedSubscriberCalls: 2,
      });

      expect(productListing.state.products).toEqual([
        {
          "additionalFields": {},
          "ec_name": "adidas_sale",
          "ec_description": "This Adidas Sneaker is on sale.",
          "ec_shortdesc": null,
          "ec_brand": "Adidas",
          "ec_category": [
            "category2"
          ],
          "ec_thumbnails": [
            "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c6f0aede76f849a18a27a91500a0c8c9_9366/Continental_80_Schoenen_Zwart_G27707_01_standard.jpg"
          ],
          "ec_images": [],
          "ec_price": 50,
          "ec_promo_price": null,
          "ec_in_stock": null,
          "ec_cogs": null,
          "ec_item_group_id": null,
          "ec_rating": null,
          "ec_product_id": null,
          "ec_gender": null,
          "ec_color": null,
          "ec_listing": "",
          "clickUri": "https://www.mystore.com/product/product3",
          "permanentid": "eac581ed395a8fe12418e6869b428f288dc9d872e74eeff5b3dbf391aae5",
          "childResults": [],
          "totalNumberOfChildResults": 0,
          "documentUri": "https://www.mystore.com/product/product3",
          "documentUriHash": "ZUZUfOT3HR5IEFIO"
        },
        {
          "additionalFields": {},
          "ec_name": "nike_sale",
          "ec_description": "This Nike Sneaker is on sale.",
          "ec_shortdesc": null,
          "ec_brand": "Nike",
          "ec_category": [
            "category1"
          ],
          "ec_thumbnails": [
            "https://static.nike.com/a/images/t_PDP_864_v1,f_auto,q_auto:eco/9c4e6929-fbbc-495e-b8af-ec76d6e163fd/wio-8-road-running-shoes-xNW8fz.png"
          ],
          "ec_images": [],
          "ec_price": 50,
          "ec_promo_price": null,
          "ec_in_stock": null,
          "ec_cogs": null,
          "ec_item_group_id": null,
          "ec_rating": null,
          "ec_product_id": null,
          "ec_gender": null,
          "ec_color": null,
          "ec_listing": "",
          "clickUri": "https://www.mystore.com/product/product1",
          "permanentid": "dcdfbab94836f1c9289098905e1321274c586989ea5a7a38ca3f3fc9a2e3",
          "childResults": [],
          "totalNumberOfChildResults": 0,
          "documentUri": "https://www.mystore.com/product/product1",
          "documentUriHash": "hpkBQkEðe6dCvyc8"
        },
        {
          "additionalFields": {},
          "ec_name": "puma_sale",
          "ec_description": "This Puma Sneaker is on sale.",
          "ec_shortdesc": null,
          "ec_brand": "Puma",
          "ec_category": [
            "category3"
          ],
          "ec_thumbnails": [
            "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_450,h_450/global/380190/03/sv01/fnd/EEA/fmt/png/CA-Pro-Classic-sneakers"
          ],
          "ec_images": [],
          "ec_price": 50,
          "ec_promo_price": null,
          "ec_in_stock": null,
          "ec_cogs": null,
          "ec_item_group_id": null,
          "ec_rating": null,
          "ec_product_id": null,
          "ec_gender": null,
          "ec_color": null,
          "ec_listing": "",
          "clickUri": "https://www.mystore.com/product/product5",
          "permanentid": "295c575599f6cd3632fa40afaaf5ddd15fbf10f73c8a2cd006be56371d7c",
          "childResults": [],
          "totalNumberOfChildResults": 0,
          "documentUri": "https://www.mystore.com/product/product5",
          "documentUriHash": "7RKkpyCRb8hDb938"
        }
      ])
    })
})
