import {Component, h, State} from '@stencil/core';
import {DidYouMean, DidYouMeanState, buildDidYouMean} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {sanitize} from '../../utils/xss-utils';

/**
 * The `atomic-did-you-mean component` is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction,
 * the component either suggests the correction or automatically triggers a new query with the suggested term.
 *
 * @part no-results - The text displayed for no results
 * @part auto-corrected - The text displayed for the automatically corrected query
 * @part correction-btn - The button that allows to manually correct a query
 * @part highlight - The query highlights
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
  @BindStateToI18n()
  @State()
  private strings = {
    withQuery: (
      key: 'noResultsFor' | 'queryAutoCorrectedTo' | 'didYouMean',
      query: string
    ) =>
      this.bindings.i18n.t(key, {
        interpolation: {escapeValue: false},
        query: `<b part="highlight">${sanitize(query)}</b>`,
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
      'noResultsFor',
      this.didYouMeanState.queryCorrection.wordCorrections[0].originalWord
    );
    const queryAutoCorrectedTo = this.strings.withQuery(
      'queryAutoCorrectedTo',
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
      'didYouMean',
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
