import type {AtomicCommerceRecommendationInterface} from '../atomic-commerce-recommendation-interface';
import {expect, test} from './fixture';

test.describe('atomic-commerce-recommendation-interface', () => {
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

  // TODO (KIT-4365): remove this test in v4
  test('should support language localization through the #language property', async ({
    commerceRecommendationInterface,
  }) => {
    await commerceRecommendationInterface.load({
      story: 'with-recommendation-list',
      args: {language: 'es'},
    });
    await commerceRecommendationInterface
      .recommendationList()
      .waitFor({state: 'visible'});
    await commerceRecommendationInterface
      .previousButton()
      .waitFor({state: 'visible'});

    await expect(
      commerceRecommendationInterface.previousButton()
      // eslint-disable-next-line @cspell/spellchecker
    ).toHaveAttribute('aria-label', 'Anterior');
  });

  test('should support localization through the #updateLocale method', async ({
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

    await commerceRecommendationInterface
      .previousButton()
      .waitFor({state: 'visible'});

    await expect(
      commerceRecommendationInterface.previousButton()
      // eslint-disable-next-line @cspell/spellchecker
    ).toHaveAttribute('aria-label', 'Précédent');
  });
});
