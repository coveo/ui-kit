import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildFrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListOptions,
} from './headless-frequently-bought-together';

describe('headless frequently-bought-together', () => {
  let frequentlyBoughtTogether: FrequentlyBoughtTogetherList;
  let engine: MockProductRecommendationEngine;

  const baseOptions: FrequentlyBoughtTogetherListOptions = {
    sku: 'some-sku',
  };

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    frequentlyBoughtTogether = buildFrequentlyBoughtTogetherList(engine, {
      options: baseOptions,
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(frequentlyBoughtTogether.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(frequentlyBoughtTogether.state.isLoading).toBe(true);
  });

  it('object shape matches original', () => {
    expect(frequentlyBoughtTogether.refresh).toBeTruthy();
    expect(frequentlyBoughtTogether.setSku).toBeTruthy();
    expect(frequentlyBoughtTogether.subscribe).toBeTruthy();
    expect(frequentlyBoughtTogether.state.error).toBeFalsy();
    expect(frequentlyBoughtTogether.state.isLoading).toBeFalsy();
    expect(frequentlyBoughtTogether.state.maxNumberOfRecommendations).toBe(5);
    expect(frequentlyBoughtTogether.state.recommendations).toBeTruthy();
    expect(frequentlyBoughtTogether.state.sku).toBeFalsy();
  });
});
