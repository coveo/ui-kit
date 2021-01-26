import {Component, h, State} from '@stencil/core';
import {DidYouMean, DidYouMeanState, buildDidYouMean} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-did-you-mean',
  styleUrl: 'atomic-did-you-mean.pcss',
  shadow: true,
})
export class AtomicDidYouMean implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private didYouMean!: DidYouMean;

  @BindStateToController('didYouMean')
  @State()
  private didYouMeanState!: DidYouMeanState;

  public initialize() {
    this.didYouMean = buildDidYouMean(this.bindings.engine);
  }

  private applyCorrection() {
    this.didYouMean.applyCorrection();
  }

  public render() {
    if (!this.didYouMeanState.hasQueryCorrection) {
      return '';
    }

    if (this.didYouMeanState.wasAutomaticallyCorrected) {
      return [
        <p>
          No results for{' '}
          <b>
            {
              this.didYouMeanState.queryCorrection.wordCorrections[0]
                .originalWord
            }
          </b>
        </p>,
        <p>
          Query was automatically corrected to{' '}
          <b>{this.didYouMeanState.wasCorrectedTo}</b>
        </p>,
      ];
    }

    return (
      <button onClick={() => this.applyCorrection()}>
        Did you mean: {this.didYouMeanState.queryCorrection.correctedQuery} ?
      </button>
    );
  }
}
