import {
  buildRecentQueriesList,
  RecentQueriesListOptions,
  RecentQueriesList as HeadlessRecentQueriesList,
  Unsubscribe,
  RecentQueriesState,
} from '@coveo/headless';
import {Component, ContextType} from 'react';
import {AppContext} from '../../context/engine';

export class RecentQueriesList extends Component<
  RecentQueriesListOptions,
  RecentQueriesState
> {
  static contextType = AppContext;
  declare context: ContextType<typeof AppContext>;

  private controller!: HeadlessRecentQueriesList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    const initialState = {queries: this.retrieveLocalStorage()};
    this.controller = buildRecentQueriesList(this.context.engine!, {
      options: this.props,
      initialState,
    });
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => {
      this.updateState();
      this.updateLocalStorage();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private retrieveLocalStorage() {
    const storedQueries = localStorage.getItem('recentQueries');
    return storedQueries ? JSON.parse(storedQueries) : [];
  }

  private updateLocalStorage() {
    localStorage.setItem(
      'recentQueries',
      JSON.stringify(this.controller.state.queries)
    );
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
        Recent queries:
        <ul>
          {this.state.queries.map((query) => (
            <li key={query}>{query}</li>
          ))}
        </ul>
      </div>
    );
  }
}
