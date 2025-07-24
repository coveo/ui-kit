import {
  buildTab,
  type Tab as HeadlessTab,
  type TabState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType, type PropsWithChildren} from 'react';
import {AppContext} from '../../context/engine';

interface TabProps {
  id: string;
  expression: string;
  active?: boolean;
}

export class Tab extends Component<PropsWithChildren<TabProps>, TabState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessTab;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildTab(this.context.engine!, {
      initialState: {isActive: !!this.props.active},
      options: {
        expression: this.props.expression,
        id: this.props.id,
      },
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
