import {Result, FoldedResultListState} from '@coveo/headless';
import {Component, Element, h, State} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {Button} from '../common/button';
import {FoldedResultListStateContext} from '../result-lists/result-list-decorators';
import {ResultContext} from '../result-template-components/result-template-decorators';

/**
 * The `atomic-load-collection` component allows to load the full collection for a folded result.
 */
@Component({
  tag: 'atomic-load-collection',
})
export class AtomicLoadMoreResults {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() public result!: Result;
  @State() public error!: Error;
  @Element() host!: HTMLElement;

  @FoldedResultListStateContext()
  @State()
  private foldedResultListState!: FoldedResultListState;

  private getCollection() {
    return this.foldedResultListState.results.find(
      (r) =>
        r.result.raw.foldingcollection === this.result.raw.foldingcollection
    )!;
  }

  private loadFullCollection() {
    this.host.dispatchEvent(
      buildCustomEvent('atomic/loadCollection', this.getCollection())
    );
  }

  private hasMoreResults() {
    return this.getCollection().moreResultsAvailable;
  }

  private hasResults() {
    return Boolean(this.getCollection().children.length);
  }

  private isLoading() {
    return Boolean(this.getCollection().isLoadingMoreResults);
  }

  public render() {
    if (!this.foldedResultListState) {
      return null;
    }
    return (
      <div>
        {this.hasMoreResults() && !this.isLoading() && (
          <Button
            style="text-primary"
            onClick={() => this.loadFullCollection()}
          >
            {this.hasResults() ? 'Load more' : 'Load collection'}
          </Button>
        )}
      </div>
    );
  }
}
