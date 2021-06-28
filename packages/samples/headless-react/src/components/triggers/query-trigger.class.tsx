import {Component, ContextType} from 'react';
import {
  buildQueryTrigger,
  QueryTrigger as HeadlessQueryTrigger,
  QueryTriggerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class QueryTrigger extends Component<{}, QueryTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessQueryTrigger;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildQueryTrigger(this.context.engine!);
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
    return (
      <div>
        The query changed from {this.state.prevQuery + ' '}
        to {this.state.newQuery}
      </div>
    );
  }
}
