import {Component, h, State} from '@stencil/core';
import {DidYouMean, DidYouMeanState, buildDidYouMean} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import escape from 'escape-html';

/**
 * The `atomic-did-you-mean` component is responsible for handling query corrections. When a query returns no result but finds a possible query correction, the component either suggests the correction or automatically triggers a new query with the suggested term.
 *
 * @part no-results - The text displayed when there are no results.
 * @part auto-corrected - The text displayed for the automatically corrected query.
 * @part correction-btn - The button used to manually correct a query.
 * @part highlight - The query highlights.
 */
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
  @State() public error!: Error;
  private strings = {
    withQuery: (
      key: 'no-results-for' | 'query-auto-corrected-to' | 'did-you-mean',
      query: string
    ) =>
      this.bindings.i18n.t(key, {
        interpolation: {escapeValue: false},
        query: `<b part="highlight">${escape(query)}</b>`,
      }),
  };

  public initialize() {
    this.didYouMean = buildDidYouMean(this.bindings.engine);
  }

  private applyCorrection() {
    this.didYouMean.applyCorrection();
  }

  private renderAutomaticallyCorrected() {
    const noResults = this.strings.withQuery(
      'no-results-for',
      this.didYouMeanState.originalQuery
    );
    const queryAutoCorrectedTo = this.strings.withQuery(
      'query-auto-corrected-to',
      this.didYouMeanState.wasCorrectedTo
    );
    return [
      <p
        class="text-on-background mb-1"
        part="no-results"
        innerHTML={noResults}
      ></p>,
      <p
        class="text-on-background"
        part="auto-corrected"
        innerHTML={queryAutoCorrectedTo}
      ></p>,
    ];
  }

  private renderCorrection() {
    const didYouMean = this.strings.withQuery(
      'did-you-mean',
      this.didYouMeanState.queryCorrection.correctedQuery
    );
    return (
      <button
        class="text-primary"
        onClick={() => this.applyCorrection()}
        innerHTML={didYouMean}
      ></button>
    );
  }

  public render() {
    if (!this.didYouMeanState.hasQueryCorrection) {
      return;
    }

    if (this.didYouMeanState.wasAutomaticallyCorrected) {
      return this.renderAutomaticallyCorrected();
    }

    return this.renderCorrection();
  }
}
