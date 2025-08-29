import {
  buildQueryTrigger,
  type QueryTrigger as HeadlessQueryTrigger,
  type QueryTriggerState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
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
    if (this.state.wasQueryModified) {
      return (
        <div>
          The query changed from {`${this.state.originalQuery} `}
          to {this.state.newQuery}
        </div>
      );
    }
    return null;
  }
}
