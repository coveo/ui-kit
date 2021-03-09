import {Component, ContextType} from 'react';
import {
  buildHistory,
  History as HeadlessHistory,
  HistoryState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class History extends Component<{}, HistoryState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessHistory;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildHistory(this.context.engine!);
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
        <button
          disabled={this.state.past.length === 0}
          onClick={() => this.controller.back()}
        >
          Back
        </button>
        <button
          disabled={this.state.future.length === 0}
          onClick={() => this.controller.forward()}
        >
          Forward
        </button>
      </div>
    );
  }
}
