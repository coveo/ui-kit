import {Component, ContextType} from 'react';
import {
  buildNotifyTrigger,
  NotifyTrigger as HeadlessNotifyTrigger,
  NotifyTriggerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class NotifyTrigger extends Component<{}, NotifyTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessNotifyTrigger;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildNotifyTrigger(this.context.engine!);
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
    return <div>The notification is: {this.state.notify}</div>;
  }
}
