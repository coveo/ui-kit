import {Component} from 'react';
import {
  buildHistoryManager,
  HistoryManager as HeadlessHistoryManager,
  HistoryManagerState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class History extends Component {
  private controller: HeadlessHistoryManager;
  public state: HistoryManagerState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildHistoryManager(engine);
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
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
