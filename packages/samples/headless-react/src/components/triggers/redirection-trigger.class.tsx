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
    this.redirect();
    this.unsubscribe = this.controller.subscribe(() => this.redirect());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private redirect() {
    this.setState(this.controller.state, () => {
      if (!this.controller.state.redirectTo) {
        return;
      }
      window.location.href = this.controller.state.redirectTo;
    });
  }

  render() {
    return null;
  }
}
