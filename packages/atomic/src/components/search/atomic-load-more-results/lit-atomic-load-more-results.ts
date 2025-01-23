import {
  buildQuerySummary,
  buildResultList,
  QuerySummary,
  QuerySummaryState,
  ResultList,
  ResultListState,
} from '@coveo/headless';
import {LitElement} from 'lit';
import {html} from 'lit-html';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '../../../decorators/bind-state.js';
import {bindingGuard} from '../../../decorators/binding-guard.js';
import {errorGuard} from '../../../decorators/error-guard.js';
import {initializeBindings} from '../../../decorators/initialize-bindings.js';
import {InitializableComponent} from '../../../decorators/types.js';
import type {Bindings} from '../atomic-search-interface/interfaces.js';

@customElement('atomic-load-more-results-lit')
export class AtomicLoadMoreResultsLit
  extends LitElement
  implements InitializableComponent
{
  public resultList!: ResultList;
  public querySummary!: QuerySummary;
  @initializeBindings() bindings!: Bindings;
  @state() public error!: Error;

  @bindStateToController('querySummary')
  @state()
  private querySummaryState!: QuerySummaryState;
  @bindStateToController('resultList')
  @state()
  private resultListState!: ResultListState;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.resultList = buildResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: [],
      },
    });
  }

  private onClick() {
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.resultList.fetchMoreResults();
  }

  @errorGuard()
  @bindingGuard()
  public render() {
    return html` <div>Total : ${this.querySummaryState.total}</div>
      <div>Has results : ${this.resultListState.hasResults}</div>
      <button @click=${this.onClick}></button>`;
  }
}
