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
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessRecentQueriesList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildRecentQueriesList(this.context.engine!, {
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
