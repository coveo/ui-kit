/* eslint-disable @cspell/spellchecker */
import {test, expect} from './fixture';

// Happy path: default render

test.describe('AtomicCommerceRecommendationInterface', () => {
  test('should render the interface', async ({
    commerceRecommendationInterface,
  }) => {
    await commerceRecommendationInterface.load({story: 'default'});
    await expect(commerceRecommendationInterface.interface()).toBeVisible();
  });

  test('should render the interface with a recommendation list', async ({
    commerceRecommendationInterface,
    page,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
    });
    await expect(
      page.locator('atomic-commerce-recommendation-list')
    ).toBeVisible();
  });

  test('should be accessible', async ({
    commerceRecommendationInterface,
    makeAxeBuilder,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
    });
    const axe = await makeAxeBuilder();
    const results = await axe.analyze();
    expect(results.violations).toEqual([]);
  });

  test('should support localization (French)', async ({
    commerceRecommendationInterface,
    page,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
      args: {language: 'fr'},
    });
    // Example: check for a French label or heading. Adjust selector as needed for your UI.
    await expect(page.locator('text=Produits recommandés')).toBeVisible();
  });
});
