import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({productRating}) => {
    await productRating.load();
  });

  test('should be accessible', async ({productRating, makeAxeBuilder}) => {
    await expect(productRating.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });

  test('should have the right number of stars', async ({productRating}) => {
    await expect(productRating.blueLagoonYellowStars).toHaveAttribute(
      'style',
      'width: 80%;'
    );
  });
});

test.describe('with a rating details field', () => {
  test.beforeEach(async ({productRating}) => {
    await productRating.load({story: 'with-a-rating-details-field'});
  });

  test('should be accessible', async ({productRating, makeAxeBuilder}) => {
    await expect(productRating.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });

  test('should show the rating details next to the rating', async ({
    productRating,
  }) => {
    await expect(productRating.hydrated.first().getByText('4')).toBeVisible();
  });
});

test.describe('with a max value in index', () => {
  test.beforeEach(async ({productRating}) => {
    await productRating.load({story: 'with-a-max-value-in-index'});
  });

  test('should be accessible', async ({productRating, makeAxeBuilder}) => {
    await expect(productRating.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });

  test('should have the right number of stars', async ({productRating}) => {
    await expect(productRating.blueLagoonYellowStars).toHaveAttribute(
      'style',
      'width: 40%;'
    );
  });
});
// test maxValueInIndex
// test different icon
