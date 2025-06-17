import {AtomicCommerceRecommendationInterface} from '../atomic-commerce-recommendation-interface';
import {test, expect} from './fixture';

test.describe('AtomicCommerceRecommendationInterface', () => {
  test('should attach itself', async ({commerceRecommendationInterface}) => {
    await commerceRecommendationInterface.load({story: 'default'});
    await expect(commerceRecommendationInterface.interface()).toBeAttached();
  });

  test('should render its children', async ({
    commerceRecommendationInterface,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
    });
    await expect(
      commerceRecommendationInterface.recommendationList()
    ).toBeVisible();
  });

  test('should be accessible', async ({
    commerceRecommendationInterface,
    makeAxeBuilder,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
    });
    await commerceRecommendationInterface
      .recommendationList()
      .waitFor({state: 'visible'});

    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test.only('should support localization through language parameter', async ({
    commerceRecommendationInterface,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
      args: {language: 'fr'},
    });

    await commerceRecommendationInterface
      .recommendationList()
      .waitFor({state: 'visible'});

    await commerceRecommendationInterface.previousButton().waitFor();

    await expect(
      commerceRecommendationInterface.previousButton()
      // eslint-disable-next-line @cspell/spellchecker
    ).toHaveAttribute('aria-label', 'Précédent');
  });

  test.only('should support localization through the #updateLocale method', async ({
    commerceRecommendationInterface,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
    });

    await commerceRecommendationInterface
      .recommendationList()
      .waitFor({state: 'visible'});

    commerceRecommendationInterface
      .interface()
      .evaluate((el: AtomicCommerceRecommendationInterface) =>
        el.updateLocale('fr', 'CA', 'CAD')
      );

    await commerceRecommendationInterface.previousButton().waitFor();

    await expect(
      commerceRecommendationInterface.previousButton()
      // eslint-disable-next-line @cspell/spellchecker
    ).toHaveAttribute('aria-label', 'Précédent');
  });
});
