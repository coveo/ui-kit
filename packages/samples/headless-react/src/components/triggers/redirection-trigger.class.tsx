import {Component, ContextType} from 'react';
import {
  buildRedirectionTrigger,
  RedirectionTrigger as HeadlessRedirectionTrigger,
  RedirectionTriggerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class RedirectionTrigger extends Component<{}, RedirectionTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRedirectionTrigger;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildRedirectionTrigger(this.context.engine!);
    this.updateState();
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidUpdate() {
    if (!this.state?.redirectTo) {
      return;
    }
    window.location.href = this.state.redirectTo;
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state) {
      return null;
    }

    return <div></div>;
  }
}
