import {Component, ContextType} from 'react';
import {
  buildPopularViewedRecommendationsList,
  PopularViewedRecommendationsList as HeadlessRecommendationList,
  PopularViewedRecommendationsListOptions,
  PopularViewedRecommendationsListState,
  loadClickAnalyticsActions,
  Unsubscribe,
  ProductRecommendation,
} from '@coveo/headless/product-recommendation';
import {AppContext} from '../../context/engine';
import {filterProtocol} from '../../utils/filter-protocol';

export class RecommendationList extends Component<
  PopularViewedRecommendationsListOptions,
  PopularViewedRecommendationsListState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRecommendationList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildPopularViewedRecommendationsList(
      this.context.productRecommendationEngine!,
      {options: this.props}
    );
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private logClick(recommendation: ProductRecommendation) {
    const engine = this.context.productRecommendationEngine;

    if (!engine) {
      return;
    }

    const {logProductRecommendationOpen} = loadClickAnalyticsActions(engine);
    engine.dispatch(logProductRecommendationOpen(recommendation));
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (this.state.error) {
      return (
        <div>
          <div>Oops {this.state.error.message}</div>
          <code>{JSON.stringify(this.state.error)}</code>
          <button onClick={() => this.controller.refresh()}>Try again</button>
        </div>
      );
    }

    if (!this.state.recommendations.length) {
      return <button onClick={() => this.controller.refresh()}>Refresh</button>;
    }

    return (
      <div>
        <button onClick={() => this.controller.refresh()}>Refresh</button>
        <ul style={{textAlign: 'left'}}>
          {this.state.recommendations.map((recommendation) => (
            <li key={recommendation.permanentid}>
              <article>
                <h2>
                  {/* Make sure to log analytics when the result link is clicked. */}
                  <a
                    href={filterProtocol(recommendation.clickUri)} // Filters out dangerous URIs that can create XSS attacks such as `javascript:`.
                    onClick={() => this.logClick(recommendation)}
                    onContextMenu={() => this.logClick(recommendation)}
                    onMouseDown={() => this.logClick(recommendation)}
                    onMouseUp={() => this.logClick(recommendation)}
                  >
                    {recommendation.ec_name}
                  </a>
                </h2>
                <p>{recommendation.ec_shortdesc}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
