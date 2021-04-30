import {Component, ContextType} from 'react';
import {
  buildFolding,
  FoldedResult,
  Folding as FoldingController,
  FoldingState,
  Unsubscribe,
} from '@coveo/headless';
import {ResultLink} from '../result-list/result-link';
import {AppContext} from '../../context/engine';

export class FoldedResultList extends Component<{}, FoldingState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: FoldingController;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildFolding(this.context.engine!);
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private renderFoldedResult({result, children}: FoldedResult) {
    return (
      <li key={result.uniqueId}>
        <article>
          <h3>
            {/* Make sure to log analytics when the result link is clicked. */}
            <ResultLink result={result}>{result.title}</ResultLink>
          </h3>
          <p>{result.excerpt}</p>
          <ul>{children.map((child) => this.renderFoldedResult(child))}</ul>
        </article>
      </li>
    );
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (!this.state.collections.length) {
      return <div>No results</div>;
    }

    return (
      <div>
        <ul style={{textAlign: 'left'}}>
          {this.state.collections.map((collection) =>
            this.renderFoldedResult(collection)
          )}
        </ul>
      </div>
    );
  }
}
