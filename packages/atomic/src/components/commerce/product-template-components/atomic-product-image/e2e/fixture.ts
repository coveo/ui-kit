import {SortBy} from '@coveo/headless/commerce';
import {CommerceSuccessResponse} from '@coveo/headless/dist/definitions/api/commerce/common/response';
import {test as base, Page} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {ProductImageObject} from './page-object';

interface TestFixture {
  productImage: ProductImageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  productImage: async ({page}, use) => {
    await use(new ProductImageObject(page));
  },
});
export {expect} from '@playwright/test';

export async function setImages(page: Page, urls: string[]) {
  await page.route('**/v2/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        facets: [],
        pagination: {
          page: 0,
          perPage: 1,
          totalEntries: 1,
          totalPages: 1,
        },
        products: [
          {
            additionalFields: {},
            children: [],
            clickUri: '',
            ec_brand: '',
            ec_category: [],
            ec_color: '',
            ec_description: '',
            ec_gender: '',
            ec_images: urls,
            ec_in_stock: true,
            ec_item_group_id: '',
            ec_listing: '',
            ec_name: 'name',
            ec_price: 0,
            ec_product_id: '',
            ec_promo_price: 0,
            ec_rating: 0,
            ec_shortdesc: '',
            ec_thumbnails: urls,
            permanentid: 'permanentid',
            totalNumberOfChildren: 0,
          },
        ],
        responseId: '',
        sort: {
          appliedSort: {sortCriteria: SortBy.Relevance},
          availableSorts: [],
        },
        triggers: [],
      } as CommerceSuccessResponse),
    });
  });
}
