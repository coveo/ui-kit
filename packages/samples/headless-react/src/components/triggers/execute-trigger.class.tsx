import {
  buildExecuteTrigger,
  type ExecuteTriggerParams,
  type ExecuteTriggerState,
  type FunctionExecutionTrigger,
  type ExecuteTrigger as HeadlessExecuteTrigger,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

export class ExecuteTrigger extends Component<{}, ExecuteTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessExecuteTrigger;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildExecuteTrigger(this.context.engine!);
    this.unsubscribe = this.controller.subscribe(() =>
      this.controller.state.executions.forEach((execution) =>
        this.executeFunction(execution)
      )
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private executeFunction = (execution: FunctionExecutionTrigger) => {
    const {functionName, params} = execution;

    if (functionName === 'log') {
      this.log(params);
    }
  };

  private log = (params: ExecuteTriggerParams) => {
    console.log('params: ', params);
  };

  render() {
    return null;
  }
}
