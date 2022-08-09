import {Component, Fragment, h, State} from '@stencil/core';
import {
  DidYouMean,
  DidYouMeanState,
  buildDidYouMean,
  QueryTrigger,
  buildQueryTrigger,
  QueryTriggerState,
} from '@coveo/headless';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import escape from 'escape-html';
import {Hidden} from '../../common/hidden';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
  protected queryTrigger!: QueryTrigger;

  @BindStateToController('didYouMean')
  @State()
  private didYouMeanState?: DidYouMeanState;
  @BindStateToController('queryTrigger')
  @State()
  private queryTriggerState?: QueryTriggerState;
  @State() public error!: Error;

  public initialize() {
    this.didYouMean = buildDidYouMean(this.bindings.engine);
    this.queryTrigger = buildQueryTrigger(this.bindings.engine);
  }

  private applyCorrection() {
    this.didYouMean.applyCorrection();
  }

  private withQuery(
    key:
      | 'no-results-for'
      | 'query-auto-corrected-to'
      | 'did-you-mean'
      | 'showing-results-for',
    query: string,
    classes?: string
  ) {
    return this.bindings.i18n.t(key, {
      interpolation: {escapeValue: false},
      query: `<b part="highlight"${
        classes ? ` class="${classes}"` : ''
      }>${escape(query)}</b>`,
    });
  }

  private renderQueryTriggerAutomaticallyCorrected() {
    const showingResultsFor = this.withQuery(
      'showing-results-for',
      this.queryTriggerState!.newQuery,
      'text-primary'
    );
    return (
      // file deepcode ignore ReactSetInnerHtml: This was escaped
      <p
        class="text-on-background text-lg mb-1"
        part="showing-results-for"
        innerHTML={showingResultsFor}
      ></p>
    );
  }

  private renderDidYouMeanAutomaticallyCorrected() {
    const noResults = this.withQuery(
      'no-results-for',
      this.didYouMeanState!.originalQuery
    );
    const queryAutoCorrectedTo = this.withQuery(
      'query-auto-corrected-to',
      this.didYouMeanState!.wasCorrectedTo
    );
    return (
      <Fragment>
        {/* file deepcode ignore ReactSetInnerHtml: This was escaped */}
        <p
          class="text-on-background mb-1"
          part="no-results"
          innerHTML={noResults}
        ></p>
        <p
          class="text-on-background"
          part="auto-corrected"
          innerHTML={queryAutoCorrectedTo}
        ></p>
      </Fragment>
    );
  }

  private renderDidYouMeanCorrection() {
    const didYouMean = this.withQuery(
      'did-you-mean',
      this.didYouMeanState!.queryCorrection.correctedQuery
    );
    return (
      <button
        class="link py-1"
        part="correction-btn"
        onClick={() => this.applyCorrection()}
        innerHTML={didYouMean}
      ></button>
    );
  }

  public render() {
    if (this.didYouMeanState?.hasQueryCorrection) {
      if (this.didYouMeanState.wasAutomaticallyCorrected) {
        return this.renderDidYouMeanAutomaticallyCorrected();
      }
      return this.renderDidYouMeanCorrection();
    }

    if (this.queryTriggerState?.wasQueryModified) {
      return this.renderQueryTriggerAutomaticallyCorrected();
    }

    return <Hidden></Hidden>;
  }
}
