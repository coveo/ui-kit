import {Component, Element, State, h, Watch} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  buildInstantResults,
  InstantResults,
  InstantResultsState,
  Result,
} from '@coveo/headless';

import {buildCustomEvent} from '../../../utils/event-utils';
import {
  InstantResultItem,
  UpdateInstantResultsCallback,
} from '../instant-results-common';

/**
 * TODO:
 * @internal
 */
@Component({
  tag: 'atomic-search-box-instant-results',
  shadow: true,
})
export class AtomicSearchBoxRecentQueries {
  @InitializeBindings() public bindings!: Bindings;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;
  private instantResults!: InstantResults;

  @BindStateToController('instantResults')
  @State()
  private instantResultsState!: InstantResultsState;

  @Watch('instantResultsState')
  updateResults() {
    if (
      !this.instantResultsState.isLoading &&
      !this.instantResultsState.error
    ) {
      this.onResultChange((prev: Result[]) => {
        if (this.instantResultsState.results.length) {
          return this.instantResultsState.results;
        } else {
          return prev;
        }
      });
    }
  }

  private onResultChange!: (cb: UpdateInstantResultsCallback) => void;

  private makeInstantResultItem() {
    return {
      onChange: (q: string) => {
        this.instantResults.updateQuery(q);
      },
      // TODO: turn this into an atomic template like the lists
      renderItem: (result: Result) => (
        <div>
          <p>{result.title}</p>
        </div>
      ),
    };
  }

  private initInstantResults(searchBoxId: string) {
    this.instantResults = buildInstantResults(this.bindings.engine, {
      options: {
        searchBoxId,
        maxResultsPerQuery: 4,
      },
    });
  }

  public initialize() {
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/searchBoxInstantResults/register',
        (
          searchBoxId: string,
          updateResults: (cb: UpdateInstantResultsCallback) => void
        ): InstantResultItem => {
          this.initInstantResults(searchBoxId);
          this.onResultChange = updateResults;
          return this.makeInstantResultItem();
        }
      )
    );
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}
