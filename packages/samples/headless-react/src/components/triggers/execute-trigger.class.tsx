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
    this.unsubscribe = this.controller.subscribe(() => this.executeFunction());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private executeFunction = () => {
    const {functionName, params} = this.controller.state;

    if (functionName === 'log') {
      this.log(params);
    }
  };

  private log = (params: [string | number | boolean]) => {
    console.log('params: ', params);
  };

  render() {
    return null;
  }
}
