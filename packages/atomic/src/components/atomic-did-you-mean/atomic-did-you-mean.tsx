import {Component, h, State} from '@stencil/core';
import {
  DidYouMean,
  DidYouMeanState,
  Unsubscribe,
  buildDidYouMean,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-did-you-mean',
  styleUrl: 'atomic-did-you-mean.css',
  shadow: true,
})
export class AtomicDidYouMean {
  @State() state!: DidYouMeanState;

  private engine!: Engine;
  private didYouMean!: DidYouMean;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.didYouMean = buildDidYouMean(this.engine);
    this.unsubscribe = this.didYouMean.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    if (!this.state.hasQueryCorrection) {
      return '';
    }

    if (this.state.wasAutomaticallyCorrected) {
      return (
        <div>
          Query was automatically corrected to {this.state.wasCorrectedTo}
        </div>
      );
    }

    return (
      <div>
        <button onClick={() => this.applyCorrection()}>
          Did you mean: {this.state.queryCorrection.correctedQuery} ?
        </button>
      </div>
    );
  }

  private applyCorrection() {
    this.didYouMean.applyCorrection();
  }

  private updateState() {
    this.state = this.didYouMean.state;
  }
}
