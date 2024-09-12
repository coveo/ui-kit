import {
  DidYouMeanState,
  DidYouMean,
  buildSearch,
  QueryTrigger,
  buildQueryTrigger,
  QueryTriggerState,
} from '@coveo/headless/commerce';
import {Component, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AutoCorrection} from '../../common/query-correction/auto-correction';
import {Correction} from '../../common/query-correction/correction';
import {QueryCorrectionGuard} from '../../common/query-correction/guard';
import {TriggerCorrection} from '../../common/query-correction/trigger-correction';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * @alpha
 *
 * The `atomic-commerce-query-correction` component is responsible for handling query corrections. When a query returns no products but finds a possible query correction, the component either suggests the correction or automatically triggers a new query with the suggested term.
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
  tag: 'atomic-commerce-did-you-mean',
  styleUrl: 'atomic-commerce-did-you-mean.pcss',
  shadow: true,
})
export class AtomicCommerceDidYouMean
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  didYouMean!: DidYouMean;
  queryTrigger!: QueryTrigger;

  @BindStateToController('didYouMean')
  @State()
  private didYouMeanState?: DidYouMeanState;
  @BindStateToController('queryTrigger')
  @State()
  private queryTriggerState?: QueryTriggerState;
  @State()
  public error!: Error;

  public initialize() {
    if (this.bindings.interfaceElement.type !== 'search') {
      this.error = new Error(
        'atomic-commerce-did-you-mean is only usable with an atomic-commerce-interface of type "search"'
      );
    }

    this.didYouMean = buildSearch(this.bindings.engine).didYouMean();
    this.queryTrigger = buildQueryTrigger(this.bindings.engine);
  }

  private get content() {
    if (!this.didYouMeanState || !this.queryTriggerState) {
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
          onClick={() => {}}
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
