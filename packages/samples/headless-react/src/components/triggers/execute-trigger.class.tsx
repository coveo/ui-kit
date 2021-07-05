import {Component, ContextType} from 'react';
import {
  buildExecuteTrigger,
  ExecuteTrigger as HeadlessExecuteTrigger,
  ExecuteTriggerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class ExecuteTrigger extends Component<{}, ExecuteTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessExecuteTrigger;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildExecuteTrigger(this.context.engine!);
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
    if (this.state.name) {
      return (
        <div>
          The executed function is {this.state.name + ' '}
          with params: {this.state.params}
        </div>
      );
    }
    return null;
  }
}
