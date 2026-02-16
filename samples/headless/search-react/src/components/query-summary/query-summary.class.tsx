import {
  buildQuerySummary,
  type QuerySummary as HeadlessQuerySummary,
  type QuerySummaryState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

export class QuerySummary extends Component<{}, QuerySummaryState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessQuerySummary;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildQuerySummary(this.context.engine!);
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
