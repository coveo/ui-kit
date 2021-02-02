import {Component} from 'react';
import {
  buildResultList,
  ResultList as ResultListController,
  ResultListState,
  Unsubscribe,
} from '@coveo/headless';
import {ResultLink} from './result-link';
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

  render() {
    if (!this.state.results.length) {
      return <div>No results</div>;
    }

    return (
      <div>
        <ul style={{textAlign: 'left'}}>
          {this.state.results.map((result) => (
            <li key={result.uniqueId}>
              <article>
                <h2>
                  {/* Make sure to log analytics when the result link is clicked. */}
                  <ResultLink result={result}>{result.title}</ResultLink>
                </h2>
                <p>{result.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
