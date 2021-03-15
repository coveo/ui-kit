import {Component, ContextType} from 'react';
import {
  buildSearchStatus,
  SearchStatus as HeadlessSearchStatus,
  SearchStatusState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class SearchStatus extends Component<{}, SearchStatusState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessSearchStatus;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildSearchStatus(this.context.engine!);
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state) {
      return null;
    }

    const {hasResults, firstSearchExecuted, isLoading} = this.state;

    if (!hasResults && !firstSearchExecuted && isLoading) {
      return <p>The first search ever is currently loading.</p>;
    }

    if (!hasResults && !firstSearchExecuted && !isLoading) {
      return <p>No search was ever executed.</p>;
    }

    if (!hasResults && firstSearchExecuted && isLoading) {
      <p>The previous search gave no results, but new ones are pending.</p>;
    }

    if (!hasResults && firstSearchExecuted && !isLoading) {
      return <p>A search was executed but gave no results.</p>;
    }

    if (hasResults && isLoading) {
      return <p>The previous search gave results, but new ones are loading.</p>;
    }

    if (hasResults && !isLoading) {
      return <p>There are results and no pending search.</p>;
    }

    // Unreachable. The code is structured this way to demonstrate possible states.
    return null;
  }
}
