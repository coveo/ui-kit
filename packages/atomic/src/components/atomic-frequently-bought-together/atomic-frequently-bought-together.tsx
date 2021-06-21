import {Component, h, State} from '@stencil/core';
import {
  ProductRecommendationEngine,
  buildProductRecommendationEngine,
  getSampleProductRecommendationEngineConfiguration,
  buildFrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListState,
  Unsubscribe,
} from '@coveo/headless/product-recommendation';

/**
 * The `atomic-frequently-bought-together` component suggests products frequently bought with the current product based on the shopping cart of other users.
 */
@Component({
  tag: 'atomic-frequently-bought-together',
  shadow: true,
})
export class AtomicProductRecommendations {
  @State() state!: FrequentlyBoughtTogetherListState;

  private engine!: ProductRecommendationEngine;
  private frequentlyBoughtTogether!: FrequentlyBoughtTogetherList;
  private unsubscribe: Unsubscribe = () => {};

  componentWillLoad() {
    const sampleConfiguration = getSampleProductRecommendationEngineConfiguration();
    this.engine = buildProductRecommendationEngine({
      configuration: {
        ...sampleConfiguration,
        searchHub: 'frequently_bought_recommendations',
      },
    });

    this.frequentlyBoughtTogether = buildFrequentlyBoughtTogetherList(
      this.engine,
      {
        options: {
          sku: 'abc',
        },
      }
    );
    this.unsubscribe = this.frequentlyBoughtTogether.subscribe(() =>
      this.updateState()
    );
    this.frequentlyBoughtTogether.refresh();
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.frequentlyBoughtTogether.state;
  }

  public render() {
    return (
      <div>
        FREQUENTLY BOUGHT TOGETHER:
        <ul>
          {this.state.recommendations.map((p) => (
            <li>{p.ec_name}</li>
          ))}
        </ul>
      </div>
    );
  }
}
