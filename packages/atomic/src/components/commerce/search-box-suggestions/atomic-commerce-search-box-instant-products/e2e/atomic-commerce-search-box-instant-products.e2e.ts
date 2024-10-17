import {test, expect} from './fixture';

// @Prop({reflect: true}) public density: ItemDisplayDensity = 'normal';
// @Prop({reflect: true}) public imageSize: ItemDisplayImageSize = 'icon';
// @Prop() public ariaLabelGenerator?: AriaLabelGenerator;
test.describe('default', () => {
  test.beforeEach(async ({instantProduct, searchBox}) => {
    await instantProduct.load();
    await searchBox.hydrated.waitFor();
    await searchBox.submitButton.click();
  });

  test('should display instant products', async ({instantProduct}) => {
    for (const product of await instantProduct.products.all()) {
      await expect(product).toBeVisible();
    }
    // const results = await instantProduct.products.all();
    // for (let i = 0; i < results.length; i++) {
    //   await expect(results[i]).toBeVisible();
    // }
  });

  test('should be clickable anywhere on the atomic-result component', async () => {
    // TODO:
  });

  test.describe('with a custom aria label', () => {
    test('should render correctly', () => {});
  });

  test.describe('with keyboard navigating', () => {
    test('should render correctly', () => {});
  });

  test.describe('with mouse navigating', () => {
    test('should render correctly', () => {});
  });
});
