import {
  buildQuickview,
  type Quickview as HeadlessQuickview,
  type QuickviewState as HeadlessQuickviewState,
  type Result,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

interface QuickviewProps {
  result: Result;
}

interface QuickviewState {
  isModalOpen: boolean;
  quickview: HeadlessQuickviewState;
}

export class Quickview extends Component<QuickviewProps, QuickviewState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessQuickview;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    const result = this.props.result;
    this.controller = buildQuickview(this.context.engine!, {
      options: {result},
    });

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState({quickview: this.controller.state});
  }

  private openModal() {
    this.controller.fetchResultContent();
    this.setState({isModalOpen: true});
  }

  private closeModal() {
    this.setState({isModalOpen: false});
  }

  render() {
    if (!this.state?.quickview.resultHasPreview) {
      return null;
    }

    if (this.state.isModalOpen) {
      return (
        <div>
          <button onClick={() => this.closeModal()}>X</button>
          <iframe
            title="Quickview"
            srcDoc={this.state.quickview.content}
          ></iframe>
        </div>
      );
    }

    return <button onClick={() => this.openModal()}>view</button>;
  }
}
