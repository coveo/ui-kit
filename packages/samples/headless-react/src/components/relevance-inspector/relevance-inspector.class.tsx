import {Component} from 'react';
import {
  buildRelevanceInspector,
  RelevanceInspector as HeadlessRelevanceInspector,
  RelevanceInspectorState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class RelevanceInspector extends Component {
  private controller: HeadlessRelevanceInspector;
  public state: RelevanceInspectorState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildRelevanceInspector(engine);
    this.state = this.controller.state;
  }

  componentDidMount() {
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
