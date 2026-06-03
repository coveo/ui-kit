import {
  buildRecentResultsList,
  type RecentResultsList as HeadlessRecentResultsList,
  type RecentResultsListOptions,
  type RecentResultsState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

export class RecentResultsList extends Component<
  RecentResultsListOptions,
  RecentResultsState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRecentResultsList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildRecentResultsList(this.context.engine!, {
      options: this.props,
    });
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

    return (
      <div>
        Recent results:
        <ul>
          {this.state.results.map((result) => (
            <li key={result.uniqueId}>{result.title}</li>
          ))}
        </ul>
      </div>
    );
  }
}
