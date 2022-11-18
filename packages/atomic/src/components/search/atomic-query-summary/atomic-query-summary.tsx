import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {QuerySummaryCommon} from '../../common/query-summary/query-summary-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-query-summary` component displays information about the current range of results and the request duration (e.g., "Results 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container for the whole summary.
 * @part results - The container for the results.
 * @part duration - The container for the duration.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
 */
@Component({
  tag: 'atomic-query-summary',
  styleUrl: 'atomic-query-summary.pcss',
  shadow: true,
})
export class AtomicQuerySummary implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public querySummary!: QuerySummary;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @State() public error!: Error;

  /**
   * Whether to display the duration of the last query execution.
   * @deprecated Use the `duration` part.
   */
  @Prop({reflect: true}) enableDuration = false;

  @AriaLiveRegion('query-summary')
  protected ariaMessage!: string;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  public render() {
    return (
      <QuerySummaryCommon
        bindings={this.bindings}
        enableDuration={this.enableDuration}
        querySummaryState={this.querySummaryState}
        setAriaLive={(msg) => (this.ariaMessage = msg)}
      />
    );
  }
}
