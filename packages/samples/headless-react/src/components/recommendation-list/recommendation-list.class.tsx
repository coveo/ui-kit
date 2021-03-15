import {Component, ContextType} from 'react';
import {ResultLink} from '../result-list/result-link';
import {
  buildRecommendationList,
  RecommendationList as HeadlessRecommendationList,
  RecommendationListState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export interface RecommendationListProps {
  id?: string;
}

export class RecommendationList extends Component<
  RecommendationListProps,
  RecommendationListState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRecommendationList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildRecommendationList(
      this.context.recommendationEngine!,
      this.props.id ? {options: {id: this.props.id}} : {}
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
                  <ResultLink result={recommendation}>
                    {recommendation.title}
                  </ResultLink>
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
