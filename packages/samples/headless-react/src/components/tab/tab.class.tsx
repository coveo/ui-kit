import {Component, ContextType} from 'react';
import {
  buildTab,
  Tab as HeadlessTab,
  TabState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export interface TabProps {
  expression?: string;
  active?: boolean;
}

export class Tab extends Component<TabProps, TabState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessTab;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildTab(this.context.engine!, {
      initialState: {isActive: !!this.props.active},
      options: {expression: this.props.expression ?? ''},
    });
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
      <button
        disabled={this.state.isActive}
        onClick={() => this.controller.select()}
      >
        {this.props.children}
      </button>
    );
  }
}
