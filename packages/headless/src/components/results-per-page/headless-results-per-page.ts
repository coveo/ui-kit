import {Engine} from '../../app/headless-engine';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../features/number-of-results/number-of-results-actions';
import {executeSearch} from '../../features/search/search-actions';
import {Component} from '../component/headless-component';

export interface ResultsPerPageOptions {
  numberOfResults: number;
}

/** The state relevant to the `ResultsPerPage` component.*/
export type ResultsPerPageState = ResultsPerPage['state'];

export class ResultsPerPage extends Component {
  constructor(
    engine: Engine,
    private options: Partial<ResultsPerPageOptions> = {}
  ) {
    super(engine);
    this.register();
  }

  /** Updates the number of results to request
   * @param number The number of results.
   */
  public set(num: number) {
    this.dispatch(updateNumberOfResults(num));
    this.dispatch(executeSearch());
  }

  /** Returns `true` if the number of results is equal to the passed value, and `false` otherwise.
   * @returns boolean
   */
  public isSetTo(num: number) {
    return num === this.state.numberOfResults;
  }

  /**
   * @returns The state of the `ResultsPerPage` component.
   */
  public get state() {
    return {
      numberOfResults: this.engine.state.numberOfResults,
    };
  }

  private register() {
    const num = this.options.numberOfResults;

    if (num !== undefined) {
      this.dispatch(registerNumberOfResults(num));
    }
  }
}
