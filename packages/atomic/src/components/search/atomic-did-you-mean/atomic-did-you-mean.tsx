import {
  DidYouMean,
  DidYouMeanState,
  buildDidYouMean,
  QueryTrigger,
  buildQueryTrigger,
  QueryTriggerState,
} from '@coveo/headless';
import {Component, Fragment, h, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LocalizedString} from '../../../utils/jsx-utils';
import {Hidden} from '../../common/hidden';
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
  // TODO: V3: Change the default to true
  /**
   * Whether to use machine learning powered query suggestions model as a fallback to provide query corrections.
   * This system requires a working and properly configured query suggestions model in the Coveo platform.
   *
   * This option is off by default. As such, the Coveo platform will use an older query correction system, powered solely by the index.
   * By opting in this new system, the Coveo Search API will stop returning the `queryCorrections` field in the response.
   * Instead, it will start returning a `changedQuery` field.
   * This implies that the usage of this option introduce a breaking change in the way query corrections are handled, both at Search API and Coveo Headless level.
   *
   * Note that in the next major version of Headless, this system will be enabled by default.
   *
   * * The default value is `false`.
   */
  @Prop({reflect: true}) public enableFallbackSearchOnEmptyQueryResults = false;

  public initialize() {
    this.didYouMean = buildDidYouMean(this.bindings.engine, {
      options: {
        automaticallyCorrectQuery: this.automaticallyCorrectQuery,
        enableFallbackSearchOnEmptyQueryResults:
          this.enableFallbackSearchOnEmptyQueryResults,
      },
    });
    this.queryTrigger = buildQueryTrigger(this.bindings.engine);
  }

  private withQuery(
    key:
      | 'no-results-for-did-you-mean'
      | 'query-auto-corrected-to'
      | 'showing-results-for',
    query: string
  ) {
    return (
      <LocalizedString
        bindings={this.bindings}
        key={key}
        params={{query: <b part="highlight">{query}</b>}}
      />
    );
  }

  private renderQueryTriggerAutomaticallyCorrected() {
    return (
      <Fragment>
        <p
          class="text-on-background leading-6 text-lg"
          part="showing-results-for"
        >
          {this.withQuery(
            'showing-results-for',
            this.queryTriggerState!.newQuery
          )}
        </p>
        <p
          class="text-on-background leading-5 text-base"
          part="search-instead-for"
        >
          <LocalizedString
            bindings={this.bindings}
            key="search-instead-for"
            params={{
              query: (
                <button
                  class="link py-1"
                  part="undo-btn"
                  onClick={() => this.queryTrigger.undo()}
                >
                  {this.queryTriggerState?.originalQuery}
                </button>
              ),
            }}
          />
        </p>
      </Fragment>
    );
  }

  private renderDidYouMeanAutomaticallyCorrected() {
    return (
      <Fragment>
        <p class="text-on-background mb-1" part="no-results">
          {this.withQuery(
            'no-results-for-did-you-mean',
            this.didYouMeanState!.originalQuery
          )}
        </p>
        <p class="text-on-background" part="auto-corrected">
          {this.withQuery(
            'query-auto-corrected-to',
            this.didYouMeanState!.wasCorrectedTo
          )}
        </p>
      </Fragment>
    );
  }

  private renderDidYouMeanCorrection() {
    return (
      <p class="text-on-background" part="did-you-mean">
        <LocalizedString
          bindings={this.bindings}
          key="did-you-mean"
          params={{
            query: (
              <button
                class="link py-1"
                part="correction-btn"
                onClick={() => this.didYouMean.applyCorrection()}
              >
                {this.didYouMeanState!.queryCorrection.correctedQuery}
              </button>
            ),
          }}
        />
      </p>
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
