import {Component} from 'react';
import {
  buildResultsPerPage,
  ResultsPerPage as HeadlessResultsPerPage,
  ResultsPerPageState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

const options = [10, 25, 50, 100];

export class ResultsPerPage extends Component {
  private controller: HeadlessResultsPerPage;
  public state: ResultsPerPageState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildResultsPerPage(engine, {
      initialState: {numberOfResults: options[0]},
    });
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

  private isSetTo(numberOfResults: number) {
    return this.controller.isSetTo(numberOfResults);
  }

  private set(numberOfResults: number) {
    this.controller.set(numberOfResults);
  }

  render() {
    return (
      <ul>
        {options.map((numberOfResults) => (
          <li key={numberOfResults}>
            <button
              disabled={this.isSetTo(numberOfResults)}
              onClick={() => this.set(numberOfResults)}
            >
              {numberOfResults}
            </button>
          </li>
        ))}
      </ul>
    );
  }
}
