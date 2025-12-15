import {Schema, StringValue} from '@coveo/bueno';
import {
  buildDidYouMean,
  buildQueryTrigger,
  type DidYouMean,
  type DidYouMeanState,
  type QueryTrigger,
  type QueryTriggerState,
} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {renderAutoCorrection} from '../../common/query-correction/auto-correction';
import {renderCorrection} from '../../common/query-correction/correction';
import {renderTriggerCorrection} from '../../common/query-correction/trigger-correction';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
@customElement('atomic-did-you-mean')
@withTailwindStyles
@bindings()
export class AtomicDidYouMean
  extends LitElement
  implements InitializableComponent<Bindings>
{
  public bindings!: Bindings;
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

  /**
   * Whether to automatically apply corrections for queries that would otherwise return no results.
   * When `automaticallyCorrectQuery` is `true`, the component automatically triggers a new query using the suggested term.
   * When `automaticallyCorrectQuery` is `false`, the component returns the suggested term without triggering a new query.
   *
   * The default value is `true`.
   */
  @property({
    reflect: true,
    type: Boolean,
    converter: booleanConverter,
    attribute: 'automatically-correct-query',
  })
  public automaticallyCorrectQuery = true;

  /**
   * Define which query correction system to use
   *
   * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
   * `next`: Query correction is powered by a machine learning system, requiring a valid query suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
   *
   * Default value is `next`.
   */
  @property({reflect: true, type: String, attribute: 'query-correction-mode'})
  public queryCorrectionMode: 'legacy' | 'next' = 'next';

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        queryCorrectionMode: this.queryCorrectionMode,
      }),
      new Schema({
        queryCorrectionMode: new StringValue({
          constrainTo: ['legacy', 'next'],
        }),
      }),
      false
    );
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

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('queryCorrectionMode')) {
      this.didYouMean?.updateQueryCorrectionMode(this.queryCorrectionMode);
    }
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
          i18nKeyShowingItemsFor: 'showing-results-for',
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
    'atomic-did-you-mean': AtomicDidYouMean;
  }
}
