import {
  buildQueryTrigger,
  buildSearch,
  type DidYouMean,
  type DidYouMeanState,
  type QueryTrigger,
  type QueryTriggerState,
} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {renderAutoCorrection} from '../../common/query-correction/auto-correction';
import {renderCorrection} from '../../common/query-correction/correction';
import {renderTriggerCorrection} from '../../common/query-correction/trigger-correction';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-did-you-mean` component is responsible for handling query corrections. When a query returns no products but finds a possible query correction, the component either suggests the correction or automatically triggers a new query with the suggested term.
 *
 * @part no-results - The text displayed when there are no products.
 * @part auto-corrected - The text displayed for the automatically corrected query.
 * @part showing-results-for - The first paragraph of the text displayed when a query trigger changes a query.
 * @part search-instead-for - The second paragraph of the text displayed when a query trigger changes a query.
 * @part did-you-mean - The text displayed around the button to manually correct a query.
 * @part correction-btn - The button used to manually correct a query.
 * @part undo-btn - The button used to undo a query changed by a query trigger.
 * @part highlight - The query highlights.
 */
@customElement('atomic-commerce-did-you-mean')
@withTailwindStyles
@bindings()
export class AtomicCommerceDidYouMean
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  public bindings!: CommerceBindings;
  didYouMean!: DidYouMean;
  queryTrigger!: QueryTrigger;

  @bindStateToController('didYouMean')
  @state()
  private didYouMeanState!: DidYouMeanState;

  @bindStateToController('queryTrigger')
  @state()
  private queryTriggerState!: QueryTriggerState;

  @state()
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
    const {hasQueryCorrection, wasAutomaticallyCorrected} =
      this.didYouMeanState;
    const hasTrigger = this.queryTriggerState.wasQueryModified;

    if (hasQueryCorrection && wasAutomaticallyCorrected) {
      return renderAutoCorrection({
        props: {
          correctedTo: this.didYouMeanState.wasCorrectedTo,
          originalQuery: this.didYouMeanState.originalQuery,
          i18n: this.bindings.i18n,
        },
      });
    }

    if (hasQueryCorrection) {
      return renderCorrection({
        props: {
          correctedQuery: this.didYouMeanState.queryCorrection.correctedQuery,
          i18n: this.bindings.i18n,
          onClick: () => this.didYouMean.applyCorrection(),
        },
      });
    }
    if (hasTrigger) {
      return renderTriggerCorrection({
        props: {
          i18n: this.bindings.i18n,
          i18nKeyShowingItemsFor: 'showing-products-for',
          correctedQuery: this.queryTriggerState.newQuery,
          originalQuery: this.queryTriggerState.originalQuery,
          onClick: () => this.queryTrigger.undo(),
        },
      });
    }
    return nothing;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const hasCorrection =
      this.didYouMeanState.hasQueryCorrection ||
      this.queryTriggerState.wasQueryModified;

    return html`${when(hasCorrection, () => this.content)}`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-did-you-mean': AtomicCommerceDidYouMean;
  }
}
