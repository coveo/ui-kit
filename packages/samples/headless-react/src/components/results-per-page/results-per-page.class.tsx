import {Component} from 'react';
import {
  buildResultsPerPage,
  ResultsPerPage as HeadlessResultsPerPage,
  ResultsPerPageState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

interface ResultsPerPageProps {
  options: number[];
}

export class ResultsPerPage extends Component<ResultsPerPageProps> {
  private controller: HeadlessResultsPerPage;
  public state: ResultsPerPageState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: ResultsPerPageProps) {
    super(props);

    this.controller = buildResultsPerPage(engine, {
      initialState: {numberOfResults: props.options[0]},
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

  render() {
    return (
      <ul>
        {this.props.options.map((numberOfResults) => (
          <li key={numberOfResults}>
            <button
              disabled={this.controller.isSetTo(numberOfResults)}
              onClick={() => this.controller.set(numberOfResults)}
            >
              {numberOfResults}
            </button>
          </li>
        ))}
      </ul>
    );
  }
}
