import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';

/** The state relevant to the `QuerySummary` controller.*/
export type QuerySummaryState = QuerySummary['state'];

export class QuerySummary extends Controller {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `QuerySummary` controller.
   */
  public get state() {
    const state = this.engine.state;
    return {
      firstResult: state.pagination.firstResult + 1,
      lastResult:
        state.pagination.firstResult + state.search.response.results.length,
      total: state.pagination.totalCountFiltered,
      query: state.search.queryExecuted,
      hasQuery: state.search.queryExecuted !== '',
      hasDuration: state.search.duration !== 0,
      hasResults: state.search.response.results.length !== 0,
      durationInMilliseconds: state.search.duration,
      durationInSeconds: this.durationInSeconds,
    };
  }

  private get durationInSeconds() {
    const state = this.engine.state;
    const inSeconds = state.search.duration / 1000;
    return Math.round((inSeconds + Number.EPSILON) * 100) / 100;
  }
}
