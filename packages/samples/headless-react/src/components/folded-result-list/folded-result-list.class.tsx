import {Component, ContextType} from 'react';
import {
  buildFoldedResultList,
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

  private renderFoldedResults(results: FoldedResult[]) {
    return results.map(({result, children}) => (
      <li key={result.uniqueId}>
        <article>
          <h3>
            {/* Make sure to log analytics when the result link is clicked. */}
            <ResultLink result={result}>{result.title}</ResultLink>
          </h3>
          <p>{result.excerpt}</p>
          <ul>{this.renderFoldedResults(children)}</ul>
        </article>
      </li>
    ));
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
          {this.state.results.map((collection) => (
            <li key={collection.result.uniqueId}>
              <article>
                <h3>
                  {/* Make sure to log analytics when the result link is clicked. */}
                  <ResultLink result={collection.result}>
                    {collection.result.title}
                  </ResultLink>
                </h3>
                <p>{collection.result.excerpt}</p>
                <ul>{this.renderFoldedResults(collection.children)}</ul>
                {collection.moreResultsAvailable && (
                  <button
                    disabled={collection.isLoadingMoreResults}
                    onClick={() => this.controller.loadCollection(collection)}
                  >
                    Show more
                  </button>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
