import {Component} from 'react';
import {ResultLink} from '../result-list/result-link';
import {
  buildRecommendationList,
  RecommendationList as HeadlessRecommendationList,
  RecommendationListState,
  Unsubscribe,
} from '@coveo/headless';
import {recommendationEngine} from '../../engine';

export interface RecommendationListProps {
  id?: string;
}

export class RecommendationList extends Component<RecommendationListProps> {
  private controller: HeadlessRecommendationList;
  public state: RecommendationListState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: RecommendationListProps) {
    super(props);

    this.controller = buildRecommendationList(
      recommendationEngine,
      props.id ? {options: {id: props.id}} : {}
    );
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
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
