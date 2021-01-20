import {Component, h, State} from '@stencil/core';
import {DidYouMean, DidYouMeanState, buildDidYouMean} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-did-you-mean',
  styleUrl: 'atomic-did-you-mean.css',
  shadow: true,
})
export class AtomicDidYouMean implements AtomicComponentInterface {
  @State() controllerState!: DidYouMeanState;

  public bindings!: Bindings;
  public controller!: DidYouMean;

  @Initialization()
  public initialize() {
    this.controller = buildDidYouMean(this.bindings.engine);
  }

  public render() {
    if (!this.controllerState.hasQueryCorrection) {
      return '';
    }

    if (this.controllerState.wasAutomaticallyCorrected) {
      return [
        <p>
          No results for{' '}
          <b>
            {
              this.controllerState.queryCorrection.wordCorrections[0]
                .originalWord
            }
          </b>
        </p>,
        <p>
          Query was automatically corrected to{' '}
          <b>{this.controllerState.wasCorrectedTo}</b>
        </p>,
      ];
    }

    return (
      <button onClick={() => this.applyCorrection()}>
        Did you mean: {this.controllerState.queryCorrection.correctedQuery} ?
      </button>
    );
  }

  private applyCorrection() {
    this.controller.applyCorrection();
  }
}
