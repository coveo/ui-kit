import {
  buildResultsPerPage,
  type ResultsPerPage as HeadlessResultsPerPage,
  type ResultsPerPageState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

interface ResultsPerPageProps {
  options: number[];
}

export class ResultsPerPage extends Component<
  ResultsPerPageProps,
  ResultsPerPageState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessResultsPerPage;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildResultsPerPage(this.context.engine!, {
      initialState: {numberOfResults: this.props.options[0]},
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
