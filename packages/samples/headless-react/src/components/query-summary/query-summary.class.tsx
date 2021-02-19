import {Component} from 'react';
import {
  buildQuerySummary,
  QuerySummary as HeadlessQuerySummary,
  QuerySummaryState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class QuerySummary extends Component {
  private controller: HeadlessQuerySummary;
  public state: QuerySummaryState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildQuerySummary(engine);
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
    const {
      hasResults,
      hasQuery,
      hasDuration,
      firstResult,
      lastResult,
      total,
      query,
      durationInSeconds,
    } = this.state;

    if (!hasResults) {
      return null;
    }

    const summary = [`Results ${firstResult}-${lastResult} of ${total}`];

    if (hasQuery) {
      summary.push(`for ${query}`);
    }

    if (hasDuration) {
      summary.push(`in ${durationInSeconds} seconds`);
    }

    return <p>{summary.join(' ')}</p>;
  }
}
