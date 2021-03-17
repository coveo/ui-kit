import {Component, ContextType} from 'react';
import {
  buildRelevanceInspector,
  RelevanceInspector as HeadlessRelevanceInspector,
  RelevanceInspectorState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class RelevanceInspector extends Component<{}, RelevanceInspectorState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRelevanceInspector;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildRelevanceInspector(this.context.engine!);
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidUpdate() {
    console.info('Debug information [class]', this.state);
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
        <label>
          Enable debug mode:{' '}
          <input
            type="checkbox"
            checked={this.state.isEnabled}
            onChange={() =>
              this.state.isEnabled
                ? this.controller.disable()
                : this.controller.enable()
            }
          />
        </label>
      </div>
    );
  }
}
