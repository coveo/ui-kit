import {Component} from 'react';
import {
  buildTab,
  Tab as HeadlessTab,
  TabState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export interface TabProps {
  expression?: string;
  active?: boolean;
}

export class Tab extends Component<TabProps> {
  private controller: HeadlessTab;
  public state: TabState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: TabProps) {
    super(props);

    this.controller = buildTab(engine, {
      initialState: {isActive: !!this.props.active},
      options: {expression: props.expression ?? ''},
    });
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
      <button
        disabled={this.state.isActive}
        onClick={() => this.controller.select()}
      >
        {this.props.children}
      </button>
    );
  }
}
