import {
  buildDidYouMean,
  type DidYouMeanState,
  type DidYouMean as HeadlessDidYouMean,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

export class DidYouMean extends Component<{}, DidYouMeanState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessDidYouMean;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildDidYouMean(this.context.engine!);
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
    if (!this.state?.hasQueryCorrection) {
      return null;
    }

    if (this.state.wasAutomaticallyCorrected) {
      return (
        <div>
          <p>
            No results for{' '}
            <b>{this.state.queryCorrection.wordCorrections![0].originalWord}</b>
          </p>
          <p>
            Query was automatically corrected to{' '}
            <b>{this.state.wasCorrectedTo}</b>
          </p>
        </div>
      );
    }

    return (
      <button onClick={() => this.controller.applyCorrection()}>
        Did you mean: {this.state.queryCorrection.correctedQuery} ?
      </button>
    );
  }
}
