import {Component} from 'react';
import {
  buildResultList,
  ResultList as ResultListController,
  ResultListState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class ResultList extends Component {
  private readonly controller: ResultListController;
  public state: ResultListState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildResultList(engine);
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

  private showMore() {
    this.controller.fetchMoreResults();
  }

  private get resultsAvailable() {
    return this.state.results.length > 0;
  }

  private get results() {
    return this.state.results.map((result) => (
      <li key={result.uniqueId}>
        <article>
          <h2>
            <a href={result.clickUri}>{result.title}</a>
          </h2>
          <p>{result.excerpt}</p>
        </article>
      </li>
    ));
  }

  render() {
    return (
      <div>
        <ul>{this.resultsAvailable ? this.results : <li>No results</li>}</ul>
        {this.resultsAvailable && (
          <button
            onClick={() => this.showMore()}
            disabled={this.state.isLoading}
          >
            Show more
          </button>
        )}
      </div>
    );
  }
}
