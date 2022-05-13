import {Component, Element, State, h} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {InstantResults, InstantResultsState} from '@coveo/headless';

import {buildCustomEvent} from '../../../utils/event-utils';
/**
 * TODO:
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

  public initialize() {
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/searchBoxInstantResults/register',
        (instantResults: InstantResults) => {
          this.instantResults = instantResults;
        }
      )
    );
  }

  public render() {
    console.log(this.instantResultsState);
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
