import {Component} from 'react';
import {
  buildQueryError,
  QueryError as HeadlessQueryError,
  QueryErrorState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class QueryError extends Component {
  private controller: HeadlessQueryError;
  public state: QueryErrorState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildQueryError(engine);
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
    if (!this.state.hasError) {
      return '';
    }

    return (
      <div>
        <div>Oops {this.state.error!.message}</div>
        <code>{JSON.stringify(this.state.error)}</code>
      </div>
    );
  }
}
