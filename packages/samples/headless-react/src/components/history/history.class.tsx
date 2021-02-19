import {Component} from 'react';
import {
  buildHistory,
  History as HeadlessHistory,
  HistoryState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class History extends Component {
  private controller: HeadlessHistory;
  public state: HistoryState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildHistory(engine);
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
