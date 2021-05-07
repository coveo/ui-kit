import {Component, ContextType} from 'react';
import {
  buildFoldedResultList,
  Collection,
  FoldedResult,
  FoldedResultList as FoldedResultListController,
  FoldedResultListState,
  Unsubscribe,
} from '@coveo/headless';
import {ResultLink} from '../result-list/result-link';
import {AppContext} from '../../context/engine';

export class FoldedResultList extends Component<{}, FoldedResultListState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: FoldedResultListController;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildFoldedResultList(this.context.engine!);
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private isCollection(
    result: Collection | FoldedResult
  ): result is Collection {
    return 'moreResultsAvailable' in result;
  }

  private renderFoldedResult(result: Collection | FoldedResult) {
    return (
      <li key={result.uniqueId}>
        <article>
          <h3>
            {/* Make sure to log analytics when the result link is clicked. */}
            <ResultLink result={result}>{result.title}</ResultLink>
          </h3>
          <p>{result.excerpt}</p>
          <ul>
            {result.children.map((child) => this.renderFoldedResult(child))}
          </ul>
          {this.isCollection(result) && result.moreResultsAvailable ? (
            <button
              disabled={result.isLoadingMoreResults}
              onClick={() => this.controller.loadAll(result)}
            >
              Show more
            </button>
          ) : null}
        </article>
      </li>
    );
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (!this.state.results.length) {
      return <div>No results</div>;
    }

    return (
      <div>
        <ul style={{textAlign: 'left'}}>
          {this.state.results.map((result) => this.renderFoldedResult(result))}
        </ul>
      </div>
    );
  }
}
