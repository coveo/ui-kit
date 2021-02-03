import {Component} from 'react';
import {
  buildDidYouMean,
  DidYouMean as HeadlessDidYouMean,
  DidYouMeanState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class DidYouMean extends Component {
  private controller: HeadlessDidYouMean;
  public state: DidYouMeanState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildDidYouMean(engine);
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
    if (!this.state.hasQueryCorrection) {
      return '';
    }

    if (this.state.wasAutomaticallyCorrected) {
      return (
        <div>
          <p>
            No results for{' '}
            <b>{this.state.queryCorrection.wordCorrections[0].originalWord}</b>
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
