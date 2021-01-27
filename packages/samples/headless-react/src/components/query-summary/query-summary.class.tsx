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
    return (
      this.state.hasQuery && (
        <p>
          Results {this.state.firstResult}-{this.state.lastResult} of{' '}
          <strong>{this.state.total}</strong> for{' '}
          <strong>{this.state.query}</strong> in{' '}
          {this.state.durationInSeconds.toLocaleString()} seconds
        </p>
      )
    );
  }
}
