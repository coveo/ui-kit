import {test} from './fixture';

test.describe('default', async () => {
  test('should display sections', async ({productTemplate}) => {
    await productTemplate.load({}, 'in-a-product-list');
  });

  /**
   * What tests ?
   *
   * When it is a child of a "product-list" + ... elements :
   *   Component becomes a "atomic-product"
   *   | - On InAProductList
   *
   *  When it is a child of a "product-recommendation" + ... elements :
   *   Component becomes a "atomic-product"
   *  | - On InAProductRecommendation
   *
   * When it is a child of a "product-search-box-instant-results" + ... elements :
   *  Component becomes a "atomic-product"
   * | - On InAProductSearchBoxInstantResults
   *
   * When it is NOT a child of a "product-list" + ... elements :
   *    Component Error
   *   | - On TODO: add new story
   *
   * When it does not have a "template" element as a child :
   *    Component Error
   *   | - On TODO: add new story
   *
   *
   * When it has sections elements and non-section elements :
   *    Console warning
   *   | - On TODO: add new story
   *
   *
   *
   *
   */
});
