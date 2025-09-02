import {
  buildResultList,
  type ResultList as ResultListController,
  type ResultListState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {Quickview} from '../quickview/quickview.class';
import {ResultLink} from './result-link';

export class ResultList extends Component<{}, ResultListState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: ResultListController;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildResultList(this.context.engine!);
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

    if (!this.state.results.length) {
      return <div>No results</div>;
    }

    return (
      <div>
        <ul style={{textAlign: 'left'}}>
          {this.state.results.map((result) => (
            <li key={result.uniqueId}>
              <article>
                <h3>
                  {/* Make sure to log analytics when the result link is clicked. */}
                  <ResultLink result={result}>{result.title}</ResultLink>
                </h3>
                <p>{result.excerpt}</p>
                <div>
                  <Quickview result={result} />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
