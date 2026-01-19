import {
  DidYouMean,
  DidYouMeanState,
  buildDidYouMean,
  QueryTrigger,
  buildQueryTrigger,
  QueryTriggerState,
} from '@coveo/headless';
import {Component, h, Prop, State, Watch} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AutoCorrection} from '../../common/query-correction/stencil-auto-correction';
import {Correction} from '../../common/query-correction/stencil-correction';
import {QueryCorrectionGuard} from '../../common/query-correction/stencil-guard';
import {TriggerCorrection} from '../../common/query-correction/stencil-trigger-correction';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-did-you-mean` component is responsible for handling query corrections. When a query returns no result but finds a possible query correction, the component either suggests the correction or automatically triggers a new query with the suggested term.
 *
 * @part no-results - The text displayed when there are no results.
 * @part auto-corrected - The text displayed for the automatically corrected query.
 * @part showing-results-for - The first paragraph of the text displayed when a query trigger changes a query.
 * @part search-instead-for - The second paragraph of the text displayed when a query trigger changes a query.
 * @part did-you-mean - The text displayed around the button to manually correct a query.
 * @part correction-btn - The button used to manually correct a query.
 * @part undo-btn - The button used to undo a query changed by a query trigger.
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

  /**
   * Whether to automatically apply corrections for queries that would otherwise return no results.
   * When `automaticallyCorrectQuery` is `true`, the component automatically triggers a new query using the suggested term.
   * When `automaticallyCorrectQuery` is `false`, the component returns the suggested term without triggering a new query.
   *
   * The default value is `true`.
   */
  @Prop({reflect: true}) public automaticallyCorrectQuery = true;

  /**
   * Define which query correction system to use
   *
   * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
   * `next`: Query correction is powered by a machine learning system, requiring a valid Query Suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
   *
   * Default value is `next`.
   */
  @Prop({reflect: true})
  public queryCorrectionMode: 'legacy' | 'next' = 'next';

  @Watch('queryCorrectionMode')
  public updateQueryCorrectionMode() {
    this.didYouMean.updateQueryCorrectionMode(this.queryCorrectionMode);
  }

  public initialize() {
    this.didYouMean = buildDidYouMean(this.bindings.engine, {
      options: {
        automaticallyCorrectQuery: this.automaticallyCorrectQuery,
        queryCorrectionMode: this.queryCorrectionMode,
      },
    });
    this.queryTrigger = buildQueryTrigger(this.bindings.engine);
  }

  private get content() {
    if (!this.queryTriggerState || !this.didYouMeanState) {
      return;
    }

    const {hasQueryCorrection, wasAutomaticallyCorrected} =
      this.didYouMeanState;
    const hasTrigger = this.queryTriggerState.wasQueryModified;

    if (hasQueryCorrection && wasAutomaticallyCorrected) {
      return (
        <AutoCorrection
          correctedTo={this.didYouMeanState.wasCorrectedTo}
          originalQuery={this.didYouMeanState.originalQuery}
          i18n={this.bindings.i18n}
        />
      );
    }
    if (hasQueryCorrection) {
      return (
        <Correction
          correctedQuery={this.didYouMeanState.queryCorrection.correctedQuery}
          i18n={this.bindings.i18n}
          onClick={() => this.didYouMean.applyCorrection()}
        />
      );
    }
    if (hasTrigger) {
      return (
        <TriggerCorrection
          i18n={this.bindings.i18n}
          correctedQuery={this.queryTriggerState.newQuery}
          originalQuery={this.queryTriggerState.originalQuery}
          onClick={() => this.queryTrigger.undo()}
        />
      );
    }
  }

  public render() {
    if (!this.didYouMeanState || !this.queryTriggerState) {
      return;
    }

    return (
      <QueryCorrectionGuard
        hasCorrection={
          this.didYouMeanState.hasQueryCorrection ||
          this.queryTriggerState.wasQueryModified
        }
      >
        {this.content}
      </QueryCorrectionGuard>
    );
  }
}
