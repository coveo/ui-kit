import {expect, test} from './fixture';

test.describe('atomic-product-rating', () => {
  test.describe('default', () => {
    test.beforeEach(async ({productRating}) => {
      await productRating.load();
      await productRating.hydrated.first().waitFor();
    });

    test('should have the right number of yellow icons', async ({
      productRating,
    }) => {
      await expect(productRating.blueLagoonYellowIcons).toHaveAttribute(
        'style',
        'width:80%;'
      );
    });
  });

  test.describe('with a rating details field', () => {
    test.beforeEach(async ({productRating}) => {
      await productRating.load({story: 'with-a-rating-details-field'});
    });

    test('should show the rating details next to the rating', async ({
      productRating,
    }) => {
      await expect(productRating.hydrated.first().getByText('4')).toBeVisible();
    });
  });

  test.describe('with a max value in index of 10', () => {
    test.beforeEach(async ({productRating}) => {
      await productRating.load({story: 'with-a-max-value-in-index'});
      await expect(productRating.hydrated.first()).toBeVisible();
    });

    test('should have the right number of yellow icons', async ({
      productRating,
    }) => {
      await expect(productRating.blueLagoonYellowIcons).toHaveAttribute(
        'style',
        'width:40%;'
      );
    });
  });

  test.describe('with a different icon', () => {
    test.beforeEach(async ({productRating}) => {
      await productRating.load({story: 'with-a-different-icon'});
      await expect(productRating.hydrated.first()).toBeVisible();
    });

    test('should have the right number of yellow icons', async ({
      productRating,
    }) => {
      await expect(productRating.blueLagoonYellowIcons).toHaveAttribute(
        'style',
        'width:80%;'
      );
    });
  });
});
