import {Component, ContextType} from 'react';
import {
  buildQueryError,
  QueryError as HeadlessQueryError,
  QueryErrorState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class QueryError extends Component<{}, QueryErrorState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessQueryError;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildQueryError(this.context.engine!);
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
    if (!this.state?.hasError) {
      return null;
    }

    return (
      <div>
        <div>Oops {this.state.error!.message}</div>
        <code>{JSON.stringify(this.state.error)}</code>
      </div>
    );
  }
}
