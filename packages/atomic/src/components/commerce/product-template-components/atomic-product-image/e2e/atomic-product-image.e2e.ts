import {test} from './fixture';

// test.describe('default', async () => {
//   test.describe('when clicking on the next button', async ({productImage}) => {
//     test.fixme('should navigate to the next image', () => {});
//     test.fixme('should not open the product', () => {});
//   });
//   test.describe('when clicking on the previous button', async ({productImage}) => {
//     test.fixme('should navigate to the previous image', () => {});
//     test.fixme('should not open the product', () => {});
//   });
// });

// default

// accessible

// image alt field

// fallback

// as carousel (cant make a story for this)

test('as carousel', async ({productImage, page}) => {
  await productImage.withMoreImages();
  await productImage.load();
  await page.waitForTimeout(10000);
});

test('when the image url is not valid, should render the component with fallback image & output error message', () => {});
test('when the image url is not a string, should render the component with fallback image & output error message', () => {});

test('when rendered as a single image', async ({productImage, page}) => {
  await productImage.withNoImage();
  await productImage.load();
  await page.waitForTimeout(10000);
});
