import {Component} from 'react';
import {
  buildSearchStatus,
  SearchStatus as HeadlessSearchStatus,
  SearchStatusState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class SearchStatus extends Component {
  private controller: HeadlessSearchStatus;
  public state: SearchStatusState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildSearchStatus(engine);
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    const {hasResults, firstSearchExecuted, isLoading} = this.state;

    if (!hasResults) {
      if (!firstSearchExecuted) {
        if (isLoading) {
          return <p>The first search ever is currently loading.</p>;
        }
        return <p>No search was ever executed.</p>;
      }

      if (isLoading) {
        return (
          <p>The previous search gave no results, but new ones are pending.</p>
        );
      }
      return <p>A search was executed but gave no results.</p>;
    }

    if (isLoading) {
      return <p>The previous search gave results, but new ones are loading.</p>;
    }
    return <p>There are results and no pending search.</p>;
  }
}
