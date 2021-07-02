import {Component, ContextType} from 'react';
import {
  buildRecommendationList,
  RecommendationList as HeadlessRecommendationList,
  RecommendationListOptions,
  RecommendationListState,
  loadClickAnalyticsActions,
  Result,
  Unsubscribe,
} from '@coveo/headless/recommendation';
import {AppContext} from '../../context/engine';
import {filterProtocol} from '../../utils/filter-protocol';

export class RecommendationList extends Component<
  RecommendationListOptions,
  RecommendationListState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRecommendationList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildRecommendationList(
      this.context.recommendationEngine!,
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

  private logClick(recommendation: Result) {
    const engine = this.context.recommendationEngine;

    if (!engine) {
      return;
    }

    const {logRecommendationOpen} = loadClickAnalyticsActions(engine);
    engine.dispatch(logRecommendationOpen(recommendation));
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
            <li key={recommendation.uniqueId}>
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
                    {recommendation.title}
                  </a>
                </h2>
                <p>{recommendation.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
