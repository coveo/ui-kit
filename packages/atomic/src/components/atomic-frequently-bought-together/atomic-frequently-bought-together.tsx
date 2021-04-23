import {Component, h, State} from '@stencil/core';
import {
  buildFrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListState,
  Unsubscribe,
  Engine,
  ProductRecommendationsAppState,
  HeadlessEngine,
  productRecommendationsAppReducers,
} from '@coveo/headless';

/**
 * The `atomic-frequently-bought-together` component suggests products frequently bought with the current product based on the shopping cart of other users.
 */
@Component({
  tag: 'atomic-frequently-bought-together',
  shadow: true,
})
export class AtomicProductRecommendations {
  @State() state!: FrequentlyBoughtTogetherListState;

  private engine!: Engine<ProductRecommendationsAppState>;
  private frequentlyBoughtTogether!: FrequentlyBoughtTogetherList;
  private unsubscribe: Unsubscribe = () => {};

  componentWillLoad() {
    const sampleConfiguration = HeadlessEngine.getSampleConfiguration();
    this.engine = new HeadlessEngine({
      configuration: {
        ...sampleConfiguration,
        search: {
          ...sampleConfiguration.search,
          searchHub: 'frequently_bought_recommendations',
        },
      },
      reducers: productRecommendationsAppReducers,
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
