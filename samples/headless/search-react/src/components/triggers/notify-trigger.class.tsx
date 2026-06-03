import {
  buildNotifyTrigger,
  type NotifyTrigger as HeadlessNotifyTrigger,
  type NotifyTriggerState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
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
    this.setState(this.controller.state, () => {
      this.state.notifications.forEach((notification) => {
        alert(`Notification: ${notification}`);
      });
    });
  }

  render() {
    return null;
  }
}
